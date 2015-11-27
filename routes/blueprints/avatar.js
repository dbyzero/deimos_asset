var CONST_ITEM_SKIN_LEFT_HAND_ID = 1;
var CONST_ITEM_SKIN_RIGHT_HAND_ID = 2;
var CONST_ITEM_SKIN_FOOT_ID = 3;
var CONST_ITEM_SKIN_CHEST_ID = 4;

var avatarBlueprint = function(avatarObject) {
    this.leftHandData = null;
    this.rightHandData = null;
    this.footData = null;
    this.chestData = null;
    this.headData = null;
    this.init(avatarObject);

    this.partsOrder = this.getDrawPartsOrder();
}

avatarBlueprint.prototype.init = function (avatarObject) {
    avatarObject.item_slot_head = avatarObject.item_slot_head || {};
    avatarObject.item_slot_head2 = avatarObject.item_slot_head2 || {};
    avatarObject.item_slot_left_hand = avatarObject.item_slot_left_hand || {};
    avatarObject.item_slot_right_hand = avatarObject.item_slot_right_hand || {};
    avatarObject.item_slot_foot = avatarObject.item_slot_foot || {};
    avatarObject.item_slot_chest = avatarObject.item_slot_chest || {};

    var colorHead = avatarObject.rgba || '#ffffff';
    var colorRightHand = avatarObject.item_slot_right_hand.color || '#ffffff';
    var colorLeftHand = avatarObject.item_slot_left_hand.color || '#ffffff';
    var colorFoot = avatarObject.item_slot_foot.color || '#ffffff';
    var colorChest = avatarObject.item_slot_chest.color || '#ffffff';

    //head spritesheed
    var typeHead1 = avatarObject.item_slot_head.id || '0';
    var typeHead2 = avatarObject.item_slot_head2.id || '0';
    var typeHead = Math.max(typeHead1) + '_' + Math.min(typeHead2);
    var spritesheetHead = getSpritesheetDirectory() + avatarObject.skin + '/head/' + typeHead + '.png';

    //right hand spritesheet
    var spritesheetRightHand = getSpritesheetDirectory() + avatarObject.skin + '/item/' +
        (avatarObject.item_slot_right_hand.id || CONST_ITEM_SKIN_RIGHT_HAND_ID) + '.png';

    //left hand spritesheet
    var spritesheetLeftHand = getSpritesheetDirectory() + avatarObject.skin + '/item/' +
        (avatarObject.item_slot_left_hand.id || CONST_ITEM_SKIN_LEFT_HAND_ID) + '.png';

    //foot spritesheet
    var spritesheetFoot = getSpritesheetDirectory() + avatarObject.skin + '/item/' +
        (avatarObject.item_slot_foot.id || CONST_ITEM_SKIN_FOOT_ID) + '.png';

    //chest spritesheet
    var spritesheetChest = getSpritesheetDirectory() + avatarObject.skin + '/item/' +
        (avatarObject.item_slot_chest.id || CONST_ITEM_SKIN_CHEST_ID) + '.png';

    this.leftHandData = {
        'color': colorLeftHand,
        'spritesheet': spritesheetLeftHand
    };

    this.rightHandData = {
        'color': colorRightHand,
        'spritesheet': spritesheetRightHand
    };

    this.footData = {
        'color': colorFoot,
        'spritesheet': spritesheetFoot
    };

    this.chestData = {
        'color': colorChest,
        'spritesheet': spritesheetChest
    };

    this.headData = {
        'color': colorHead,
        'spritesheet': spritesheetHead
    };
}

avatarBlueprint.prototype.getDrawPartsOrder = function () {
    var partsOrderRightOrientation = [
        this.leftHandData,
        this.footData,
        this.chestData,
        this.headData,
        this.rightHandData,
    ];

    var partsOrderLeftOrientation = [
        this.rightHandData,
        this.footData,
        this.chestData,
        this.headData,
        this.leftHandData,
    ];

    var partsOrder = {
        'standRight': {
            'drawZone': {
                'x': 0,
                'y': 0,
                'width': 1000,
                'height': 100
            },
            'partsOrder' : partsOrderRightOrientation
        },
        'standLeft': {
            'drawZone': {
                'x': 0,
                'y': 100,
                'width': 1000,
                'height': 100
            },
            'partsOrder' : partsOrderLeftOrientation
        },
        'attackStandRight': {
            'drawZone': {
                'x': 0,
                'y': 200,
                'width': 1000,
                'height': 100
            },
            'partsOrder' : partsOrderRightOrientation
        },
        'attackStandLeft': {
            'drawZone': {
                'x': 0,
                'y': 300,
                'width': 1000,
                'height': 100
            },
            'partsOrder' : partsOrderLeftOrientation
        },
        'runRight': {
            'drawZone': {
                'x': 0,
                'y': 400,
                'width': 1000,
                'height': 100
            },
            'partsOrder' : partsOrderRightOrientation
        },
        'runLeft': {
            'drawZone': {
                'x': 0,
                'y': 500,
                'width': 1000,
                'height': 100
            },
            'partsOrder' : partsOrderLeftOrientation
        },
        'attackRunRight': {
            'drawZone': {
                'x': 0,
                'y': 600,
                'width': 1000,
                'height': 100
            },
            'partsOrder' : partsOrderRightOrientation
        },
        'attackRunLeft': {
            'drawZone': {
                'x': 0,
                'y': 700,
                'width': 1000,
                'height': 100
            },
            'partsOrder' : partsOrderLeftOrientation
        },
        'flyRight': {
            'drawZone': {
                'x': 0,
                'y': 800,
                'width': 1000,
                'height': 100
            },
            'partsOrder' : partsOrderRightOrientation
        },
        'flyLeft': {
            'drawZone': {
                'x': 0,
                'y': 900,
                'width': 1000,
                'height': 100
            },
            'partsOrder' : partsOrderLeftOrientation
        },
        'attackFlyRight': {
            'drawZone': {
                'x': 0,
                'y': 1000,
                'width': 1000,
                'height': 100
            },
            'partsOrder' : partsOrderRightOrientation
        },
        'attackFlyLeft': {
            'drawZone': {
                'x': 0,
                'y': 1100,
                'width': 1000,
                'height': 100
            },
            'partsOrder' : partsOrderRightOrientation
        },
    }

    return partsOrder;
}

module.exports = avatarBlueprint;

var getSpritesheetDirectory = function () {
    return process.env.PWD + '/spritesheets/';
}
