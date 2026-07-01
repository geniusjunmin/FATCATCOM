using System.Collections.Concurrent;
using System.Threading.Channels;

namespace FatCat.Application;

public sealed class SocialEventBroker
{
    private readonly ConcurrentDictionary<Guid, ConcurrentDictionary<Guid, Channel<SocialRealtimeEventDto>>> subscribers = new();

    public SocialEventSubscription Subscribe(Guid playerId)
    {
        var subscriptionId = Guid.NewGuid();
        var channel = Channel.CreateUnbounded<SocialRealtimeEventDto>(new UnboundedChannelOptions
        {
            SingleReader = true,
            SingleWriter = false,
        });
        subscribers.GetOrAdd(playerId, _ => new ConcurrentDictionary<Guid, Channel<SocialRealtimeEventDto>>())
            [subscriptionId] = channel;
        return new SocialEventSubscription(channel.Reader, () => Remove(playerId, subscriptionId));
    }

    public void Publish(Guid playerId, SocialRealtimeEventDto socialEvent)
    {
        if (!subscribers.TryGetValue(playerId, out var playerSubscribers))
        {
            return;
        }

        foreach (var channel in playerSubscribers.Values)
        {
            channel.Writer.TryWrite(socialEvent);
        }
    }

    private void Remove(Guid playerId, Guid subscriptionId)
    {
        if (!subscribers.TryGetValue(playerId, out var playerSubscribers))
        {
            return;
        }
        playerSubscribers.TryRemove(subscriptionId, out _);
        if (playerSubscribers.IsEmpty)
        {
            subscribers.TryRemove(playerId, out _);
        }
    }
}

public sealed class SocialEventSubscription(ChannelReader<SocialRealtimeEventDto> reader, Action dispose) : IDisposable
{
    public ChannelReader<SocialRealtimeEventDto> Reader { get; } = reader;

    public void Dispose()
    {
        dispose();
    }
}
