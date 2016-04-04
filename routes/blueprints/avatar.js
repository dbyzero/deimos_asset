var CONST_ITEM_SKIN_HEAD_1 = 0;
var CONST_ITEM_SKIN_HEAD_2 = 0;
var CONST_ITEM_SKIN_LEFT_HAND_ID = 1;
var CONST_ITEM_SKIN_RIGHT_HAND_ID = 1;
var CONST_ITEM_SKIN_FOOT_ID = 2;
var CONST_ITEM_SKIN_CHEST_ID = 3;

var avatarBlueprint = function(avatarObject) {
    this.leftHandData = null;
    this.rightHandData = null;
    this.footData = null;
    this.chestData = null;
    this.headData = null;
    this.init(avatarObject);
    this.layers = this.getDrawPartsOrder();
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
    var typeHead1 = avatarObject.item_slot_head.id || CONST_ITEM_SKIN_HEAD_1;
    var typeHead2 = avatarObject.item_slot_head2.id || CONST_ITEM_SKIN_HEAD_2;
    var typeHead = Math.max(typeHead1) + '_' + Math.min(typeHead2);
    var spritesheetHead = getSpritesheetDirectory() +  '/avatar/head/' + typeHead + '.png';

    //right hand spritesheet
    var spritesheetRightHand = getSpritesheetDirectory() + '/avatar/handR/' +
        (avatarObject.item_slot_right_hand.id || CONST_ITEM_SKIN_RIGHT_HAND_ID) + '.png';

    //left hand spritesheet
    var spritesheetLeftHand = getSpritesheetDirectory() + '/avatar/handL/' +
        (avatarObject.item_slot_left_hand.id || CONST_ITEM_SKIN_LEFT_HAND_ID) + '.png';

    //foot spritesheet
    var spritesheetFoot = getSpritesheetDirectory() + '/avatar/feet/' +
        (avatarObject.item_slot_foot.id || CONST_ITEM_SKIN_FOOT_ID) + '.png';

    //chest spritesheet
    var spritesheetChest = getSpritesheetDirectory() + '/avatar/body/' +
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

    var animationType = [
        "standRight",
        "standLeft",
        "attackStandRight",
        "attackStandLeft",
        "runRight",
        "runLeft",
        "attackRunRight",
        "attackRunLeft",
        "flyRight",
        "flyLeft",
        "attackFlyRight",
        "attackFlyLeft"
    ];

    var partsOrder = animationType.map(function(animation,index){
        return {
            'animationName': animation,
            'drawZone': {
                'x': 0,
                'y': index * 100, //one animation width is 100px
                'width': 800, //we are on 8 steps aimation
                'height': 100 //animation are 100px height
            },
            'partsOrder' : index % 2 ? partsOrderLeftOrientation : partsOrderRightOrientation
        };
    });

    return partsOrder;
}

module.exports = avatarBlueprint;

var getSpritesheetDirectory = function () {
    return process.env.PWD + '/spritesheets';
}
