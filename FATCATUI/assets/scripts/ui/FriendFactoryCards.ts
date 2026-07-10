export type FriendFactoryRoomView = {
    floor: string;
    name: string;
    level: number;
    productionText: string;
    assignedCatCount: number;
    featuredCatName: string;
    decorScore: number;
    decorations: Array<{ name: string; score: number }>;
    roomArt?: string;
    catArt?: string[];
};

type FriendFactoryBaseView = {
    friendId: string;
    friendName: string;
    friendLevel: number;
    friendIncomeText: string;
    friendStatus: string;
    profileMarkup: string;
    canHelp: boolean;
    rooms: FriendFactoryRoomView[];
};

export type FriendSnapshotCardView = FriendFactoryBaseView & {
    incomePercent: number;
    rewardText: string;
    lastVisitText: string;
    lastGiftText: string;
};

export type FriendFactoryDetailView = FriendFactoryBaseView & {
    sourceText: string;
    topFloorText: string;
    staffedRoomsText: string;
    decorTotalText: string;
};

export type FriendVisitSceneView = FriendFactoryBaseView & {
    backdropArt: string;
    mascotArt: string;
    roomTotalText: string;
    topFloorText: string;
    staffedRoomsText: string;
    decorTotalText: string;
    rewardText: string;
    lastVisitText: string;
    lastGiftText: string;
};

function renderDecorTags(decorations: Array<{ name: string; score: number }>): string {
    if (decorations.length <= 0) {
        return `<span class="room-decor-tags"><s>暂无装饰</s></span>`;
    }
    return `<span class="room-decor-tags">${decorations.slice(0, 2).map(decor => `<s>${decor.name} +${decor.score}</s>`).join("")}</span>`;
}

function renderRoomCats(catArt: string[]): string {
    return catArt.map(art => `<span style="background-image:url('${art}')"></span>`).join("");
}

export function renderFriendSnapshotCard(view: FriendSnapshotCardView): string {
    const floors = view.rooms.slice(0, 3)
        .map(room => `<div class="snapshot-floor"><i>${room.floor}</i><b>${room.name}</b><em>${room.productionText}</em></div>`)
        .join("");

    return `<div class="friend-snapshot-card" data-friend-id="${view.friendId}"><div class="snapshot-head"><span class="friend-avatar"><i class="friend-rank">工厂</i></span><div class="snapshot-copy"><b>${view.friendName} 工厂快照</b><em>Lv.${view.friendLevel} · 收益 ${view.friendIncomeText} · ${view.friendStatus}</em>${view.profileMarkup}<div class="snapshot-meter"><i style="width:${view.incomePercent}%"></i></div></div><div class="snapshot-action"><button class="tag" data-action="visitFriend" data-id="${view.friendId}">访问</button><button class="tag warn" data-action="sendFriendGift" data-id="${view.friendId}">送礼</button><button class="tag boost" data-action="helpFriend" data-id="${view.friendId}" ${view.canHelp ? "" : "disabled"}>助力</button></div></div><div class="snapshot-stats"><span>访问奖励<b>${view.rewardText}</b></span><span>最近访问<b>${view.lastVisitText}</b></span><span>礼物状态<b>${view.lastGiftText}</b></span></div><div class="snapshot-floors">${floors}</div></div>`;
}

export function renderFriendFactoryDetailCard(view: FriendFactoryDetailView): string {
    const roomRows = view.rooms.slice(0, 6)
        .map(room => `<div class="factory-room-row"><i>${room.floor}</i><b>${room.name}<small>Lv.${room.level} · ${room.featuredCatName} · 猫 ${room.assignedCatCount} · 装饰 ${room.decorScore}</small>${renderDecorTags(room.decorations)}</b><em>${room.productionText}</em></div>`)
        .join("");

    return `<div class="friend-factory-detail" data-friend-id="${view.friendId}"><div class="factory-detail-head"><div><b>${view.friendName} 工厂详情</b><em>${view.sourceText} · ${view.rooms.length} 个楼层</em></div><button class="tag" data-action="openFriendVisitScene" data-id="${view.friendId}">进入访问</button></div><div class="factory-detail-stats"><span>主力楼层<b>${view.topFloorText}</b></span><span>派驻房间<b>${view.staffedRoomsText}</b></span><span>装饰评分<b>${view.decorTotalText}</b></span></div><div class="factory-room-list">${roomRows}</div></div>`;
}

export function renderFriendVisitSceneCard(view: FriendVisitSceneView): string {
    const floorRows = view.rooms.slice(0, 6)
        .map(room => `<div class="friend-scene-floor"><i>${room.floor}</i><span class="room-thumb asset" style="background-image:url('${room.roomArt ?? ""}')"></span><b>${room.name}<small>Lv.${room.level} · ${room.featuredCatName} · 猫 ${room.assignedCatCount}</small><span class="room-cats">${renderRoomCats(room.catArt ?? [])}</span>${renderDecorTags(room.decorations)}</b><em>${room.productionText}</em></div>`)
        .join("");

    return `<div class="friend-visit-scene" data-friend-id="${view.friendId}" style="--friend-factory-art:url('${view.backdropArt}')"><div class="friend-scene-head"><span class="friend-avatar"><i class="friend-rank">VISIT</i></span><div><b>${view.friendName} 访问中</b><em>公司 Lv.${view.friendLevel} · ${view.friendStatus} · ${view.rooms.length} 个楼层</em>${view.profileMarkup}</div><button class="friend-scene-close" data-action="closeFriendVisitScene" aria-label="关闭好友工厂">×</button></div><div class="friend-scene-sign"><span>好友咖啡工坊</span><small>今日参观通行证</small></div><div class="friend-scene-stage"><div class="friend-scene-building">${floorRows}</div><div class="friend-scene-side"><div class="friend-scene-mascot"><i style="background-image:url('${view.mascotArt}')"></i><b>访客猫</b><small>正在巡楼</small></div><span>总收益<b>${view.friendIncomeText}</b></span><span>房间合计<b>${view.roomTotalText}</b></span><span>主力楼层<b>${view.topFloorText}</b></span><span>值班房间<b>${view.staffedRoomsText}</b></span><span>装饰评分<b>${view.decorTotalText}</b></span></div></div><div class="friend-scene-reward"><span>访问奖励<b>${view.rewardText}</b></span><span>上次访问<b>${view.lastVisitText}</b></span><span>礼物状态<b>${view.lastGiftText}</b></span></div><div class="friend-scene-actions"><button class="tag" data-action="refreshFriendProfile" data-id="${view.friendId}">同步资料</button><button class="tag" data-action="visitFriend" data-id="${view.friendId}">领取访问</button><button class="tag warn" data-action="sendFriendGift" data-id="${view.friendId}">赠送猫粮</button><button class="tag boost" data-action="helpFriend" data-id="${view.friendId}" ${view.canHelp ? "" : "disabled"}>生产助力</button><button class="tag" data-action="closeFriendVisitScene">返回列表</button></div></div>`;
}
