// constants.js - All constants, lookup tables, and data model constructors
// Source: EditItDoc.h, EditItDocConst.cpp

// ============================================================================
// GUI Constants
// ============================================================================

export const MAXLEVEL = 87;
export const SHOPMAXTRADE = 5;
export const SOFT_MAX_COLS = 75;  // Warning threshold for line length
export const HARD_MAX_COLS = 80;  // Error threshold for line length
export const MAX_VNUM = 65534;

// Reverse direction mapping: North↔South, East↔West, Up↔Down
export const REV_DIR = [2, 3, 0, 1, 5, 4];

// ============================================================================
// Application metadata (used by the About dialog)
// ============================================================================

export const APP_NAME = 'EditIt Web';
export const APP_VERSION = '1.0.0 (beta)';
export const APP_DESCRIPTION = 'Silmaril MUD area file editor';
export const GITHUB_URL = 'https://github.com/silmarilmud/editit';

// ============================================================================
// ACT_* - Mobile action flags
// ============================================================================

export const ACT_IS_NPC = 1;
export const ACT_SENTINEL = 2;
export const ACT_SCAVENGER = 4;
export const ACT_TO_VINDICATE = 8;
export const ACT_HUNTER = 16;
export const ACT_AGGRESSIVE = 32;
export const ACT_STAY_AREA = 64;
export const ACT_WIMPY = 128;
export const ACT_PET = 256;
export const ACT_TRAIN = 512;
export const ACT_PRACTICE = 1024;
export const ACT_GAMBLE = 2048;
export const ACT_VINDICATIVE = 4096;
export const ACT_PEACEFUL = 8192;
export const ACT_GUARD = 16384;
export const ACT_MOVED = 131072;
export const ACT_SAVEMOB = 536870912;
export const ACT_SPECIAL = 1073741824;

export const ACT_MASK =
    ACT_IS_NPC | ACT_SENTINEL | ACT_SCAVENGER | ACT_TO_VINDICATE | ACT_HUNTER |
    ACT_AGGRESSIVE | ACT_STAY_AREA | ACT_WIMPY | ACT_PET | ACT_TRAIN | ACT_PRACTICE |
    ACT_GAMBLE | ACT_VINDICATIVE | ACT_PEACEFUL | ACT_GUARD | ACT_SAVEMOB | ACT_SPECIAL;

export const ACT_DONT_SET = ACT_HUNTER | ACT_PET | ACT_MOVED;

// ============================================================================
// AFF_* - Affect flags
// ============================================================================

export const AFF_BLIND = 1;
export const AFF_INVISIBLE = 2;
export const AFF_DETECT_EVIL = 4;
export const AFF_DETECT_INVIS = 8;
export const AFF_DETECT_MAGIC = 16;
export const AFF_DETECT_HIDDEN = 32;
export const AFF_HOLD = 64;
export const AFF_SANCTUARY = 128;
export const AFF_FAERIE_FIRE = 256;
export const AFF_INFRARED = 512;
export const AFF_CURSE = 1024;
export const AFF_CHANGE_SEX = 2048;
export const AFF_POISON = 4096;
export const AFF_PROTECT = 8192;
export const AFF_POLYMORPH = 16384;
export const AFF_SNEAK = 32768;
export const AFF_HIDE = 65536;
export const AFF_SLEEP = 131072;
export const AFF_CHARM = 262144;
export const AFF_FLYING = 524288;
export const AFF_PASS_DOOR = 1048576;
export const AFF_WATERWALK = 2097152;
export const AFF_SUMMONED = 4194304;
export const AFF_MUTE = 8388608;
export const AFF_GILLS = 16777216;
export const AFF_VAMP_BITE = 33554432;
export const AFF_GHOUL = 67108864;
export const AFF_FLAMING = 134217728;
export const AFF_MORTAL_POISON = 268435456;
export const AFF_PARALYZED = 536870912;
export const AFF_PIETRIFIED = 1073741824;

export const AFF_MASK =
    AFF_BLIND | AFF_INVISIBLE | AFF_DETECT_EVIL | AFF_DETECT_INVIS |
    AFF_DETECT_MAGIC | AFF_DETECT_HIDDEN | AFF_HOLD | AFF_SANCTUARY |
    AFF_FAERIE_FIRE | AFF_INFRARED | AFF_CURSE | AFF_CHANGE_SEX |
    AFF_POISON | AFF_PROTECT | AFF_POLYMORPH | AFF_SNEAK | AFF_HIDE |
    AFF_SLEEP | AFF_CHARM | AFF_FLYING | AFF_PASS_DOOR | AFF_WATERWALK |
    AFF_SUMMONED | AFF_MUTE | AFF_GILLS | AFF_VAMP_BITE | AFF_GHOUL | AFF_FLAMING |
    AFF_MORTAL_POISON | AFF_PARALYZED | AFF_PIETRIFIED;

export const AFF_MOB_MASK =
    AFF_BLIND | AFF_INVISIBLE | AFF_DETECT_EVIL | AFF_DETECT_INVIS |
    AFF_DETECT_MAGIC | AFF_DETECT_HIDDEN | AFF_HOLD | AFF_SANCTUARY |
    AFF_FAERIE_FIRE | AFF_INFRARED | AFF_CURSE |
    AFF_POISON | AFF_PROTECT | AFF_SNEAK | AFF_HIDE |
    AFF_SLEEP | AFF_CHARM | AFF_FLYING | AFF_PASS_DOOR | AFF_WATERWALK |
    AFF_SUMMONED | AFF_MUTE | AFF_GILLS | AFF_VAMP_BITE | AFF_GHOUL | AFF_FLAMING |
    AFF_MORTAL_POISON | AFF_PARALYZED | AFF_PIETRIFIED;

export const AFF_OBJ_MASK =
    AFF_BLIND | AFF_INVISIBLE | AFF_DETECT_EVIL | AFF_DETECT_INVIS |
    AFF_DETECT_MAGIC | AFF_DETECT_HIDDEN | AFF_HOLD | AFF_SANCTUARY |
    AFF_FAERIE_FIRE | AFF_INFRARED | AFF_CURSE | AFF_CHANGE_SEX |
    AFF_PROTECT | AFF_SNEAK | AFF_HIDE |
    AFF_SLEEP | AFF_FLYING | AFF_PASS_DOOR | AFF_WATERWALK |
    AFF_MUTE | AFF_GILLS | AFF_FLAMING;

export const AFF_DONT_SET =
    AFF_POISON | AFF_POLYMORPH | AFF_CHARM | AFF_SUMMONED |
    AFF_VAMP_BITE | AFF_GHOUL | AFF_MORTAL_POISON;

// ============================================================================
// SEX_* - Gender constants
// ============================================================================

export const SEX_NEUTRAL = 0;
export const SEX_MALE = 1;
export const SEX_FEMALE = 2;

// ============================================================================
// ITEM_* - Object type constants
// ============================================================================

export const ITEM_LIGHT = 1;
export const ITEM_SCROLL = 2;
export const ITEM_WAND = 3;
export const ITEM_STAFF = 4;
export const ITEM_WEAPON = 5;
export const ITEM_INSTRUMENT = 6;
export const ITEM_STATUE = 7;
export const ITEM_TREASURE = 8;
export const ITEM_ARMOR = 9;
export const ITEM_POTION = 10;
export const ITEM_FURNITURE = 12;
export const ITEM_TRASH = 13;
export const ITEM_SCABBARD = 14;
export const ITEM_CONTAINER = 15;
export const ITEM_QUIVER = 16;
export const ITEM_DRINK_CON = 17;
export const ITEM_KEY = 18;
export const ITEM_FOOD = 19;
export const ITEM_MONEY = 20;
export const ITEM_WARSOUND = 21;
export const ITEM_BOAT = 22;
export const ITEM_CORPSE_NPC = 23;
export const ITEM_CORPSE_PC = 24;
export const ITEM_FOUNTAIN = 25;
export const ITEM_PILL = 26;
export const ITEM_PROJECTILE = 27;
export const ITEM_BUILDING = 28;
export const ITEM_PORTAL = 29;
export const ITEM_CAMERA = 30;
export const ITEM_TRAP = 31;
export const ITEM_PAPER = 32;
export const ITEM_BOOK = 33;
export const ITEM_TARGET = 34;

// ============================================================================
// ITEM_* extra flags
// ============================================================================

export const ITEM_GLOW = 1;
export const ITEM_HUM = 2;
export const ITEM_DARK = 4;
export const ITEM_LOCK = 8;
export const ITEM_EVIL = 16;
export const ITEM_INVIS = 32;
export const ITEM_MAGIC = 64;
export const ITEM_NODROP = 128;
export const ITEM_BLESS = 256;
export const ITEM_ANTI_GOOD = 512;
export const ITEM_ANTI_EVIL = 1024;
export const ITEM_ANTI_NEUTRAL = 2048;
export const ITEM_NOREMOVE = 4096;
export const ITEM_INVENTORY = 8192;
export const ITEM_POISONED = 16384;
export const ITEM_VAMPIRE_BANE = 32768;
export const ITEM_HOLY = 65536;
export const ITEM_CAN_SHOOT = 131072;
export const ITEM_SHOOTABLE = 262144;
export const ITEM_THROWABLE = 524288;
export const ITEM_BOOMERANG_STYLE = 1048576;
export const ITEM_MORTAL_POISONED = 2097152;
export const ITEM_NO_RENT = 4194304;

export const ITEM_MASK =
    ITEM_GLOW | ITEM_HUM | ITEM_DARK | ITEM_LOCK | ITEM_EVIL | ITEM_INVIS |
    ITEM_MAGIC | ITEM_NODROP | ITEM_BLESS | ITEM_ANTI_GOOD | ITEM_ANTI_EVIL |
    ITEM_ANTI_NEUTRAL | ITEM_NOREMOVE | ITEM_INVENTORY | ITEM_POISONED |
    ITEM_VAMPIRE_BANE | ITEM_HOLY | ITEM_CAN_SHOOT | ITEM_SHOOTABLE |
    ITEM_THROWABLE | ITEM_BOOMERANG_STYLE | ITEM_MORTAL_POISONED;

// ============================================================================
// ITEM_* wear flags
// ============================================================================

export const ITEM_TAKE = 1;
export const ITEM_WEAR_FINGER = 2;
export const ITEM_WEAR_NECK = 4;
export const ITEM_WEAR_BODY = 8;
export const ITEM_WEAR_HEAD = 16;
export const ITEM_WEAR_LEGS = 32;
export const ITEM_WEAR_FEET = 64;
export const ITEM_WEAR_HANDS = 128;
export const ITEM_WEAR_ARMS = 256;
export const ITEM_WEAR_SHIELD = 512;
export const ITEM_WEAR_ABOUT = 1024;
export const ITEM_WEAR_WAIST = 2048;
export const ITEM_WEAR_WRIST = 4096;
export const ITEM_WIELD = 8192;
export const ITEM_HOLD = 16384;
export const ITEM_WEAR_EYES = 32768;
export const ITEM_WEAR_SHOULDERS = 65536;
export const ITEM_WEAR_EARS = 131072;
export const ITEM_WEAR_FOREHEAD = 262144;
export const ITEM_WEAR_CHEST = 524288;
export const ITEM_WEAR_SIDE = 1048576;

export const ITEM_WEAR_MASK =
    ITEM_TAKE | ITEM_WEAR_FINGER | ITEM_WEAR_NECK | ITEM_WEAR_BODY |
    ITEM_WEAR_HEAD | ITEM_WEAR_LEGS | ITEM_WEAR_FEET | ITEM_WEAR_HANDS |
    ITEM_WEAR_ARMS | ITEM_WEAR_SHIELD | ITEM_WEAR_ABOUT | ITEM_WEAR_WAIST |
    ITEM_WEAR_WRIST | ITEM_WIELD | ITEM_HOLD | ITEM_WEAR_EYES |
    ITEM_WEAR_SHOULDERS | ITEM_WEAR_EARS | ITEM_WEAR_FOREHEAD |
    ITEM_WEAR_CHEST | ITEM_WEAR_SIDE;

// ============================================================================
// APPLY_* - Object apply types
// ============================================================================

export const APPLY_STR = 1;
export const APPLY_DEX = 2;
export const APPLY_INT = 3;
export const APPLY_WIS = 4;
export const APPLY_CON = 5;
export const APPLY_SEX = 6;
export const APPLY_CLASS = 7;
export const APPLY_LEVEL = 8;
export const APPLY_AGE = 9;
export const APPLY_HEIGHT = 10;
export const APPLY_WEIGHT = 11;
export const APPLY_MANA = 12;
export const APPLY_HIT = 13;
export const APPLY_MOVE = 14;
export const APPLY_GOLD = 15;
export const APPLY_EXP = 16;
export const APPLY_AC = 17;
export const APPLY_HITROLL = 18;
export const APPLY_DAMROLL = 19;
export const APPLY_SAVING_PARA = 20;
export const APPLY_SAVING_ROD = 21;
export const APPLY_SAVING_PETRI = 22;
export const APPLY_SAVING_BREATH = 23;
export const APPLY_SAVING_SPELL = 24;
export const APPLY_RACE = 25;
export const APPLY_SNEAK = 26;
export const APPLY_HIDE = 27;

// ============================================================================
// VALUE_IS_* - Object value type identifiers
// ============================================================================

export const VALUE_IS_UNUSED = 0;
export const VALUE_IS_LIGHT = 1;
export const VALUE_IS_NUMBER = 2;
export const VALUE_IS_SPELL = 3;
export const VALUE_IS_NUMBER_FROM_0 = 4;
export const VALUE_IS_WEAPON = 5;
export const VALUE_IS_CONTAINER_FLAGS = 6;
export const VALUE_IS_KEY_VNUM = 7;
export const VALUE_IS_LIQUID = 8;
export const VALUE_IS_POISON = 9;
export const VALUE_IS_VNUM = 10;
export const VALUE_IS_FURNITURE_FLAGS = 11;
export const VALUE_IS_TRAPTYPE = 12;
export const VALUE_IS_TRAPDAMAGE = 13;

// ============================================================================
// WEAPON_* - Weapon damage types
// ============================================================================

export const WEAPON_HIT = 0;
export const WEAPON_SLICE = 1;
export const WEAPON_STAB = 2;
export const WEAPON_SLASH = 3;
export const WEAPON_WHIP = 4;
export const WEAPON_CLAW = 5;
export const WEAPON_BOW = 6;
export const WEAPON_POUND = 7;
export const WEAPON_CRUSH = 8;
export const WEAPON_GREP = 9;
export const WEAPON_BITE = 10;
export const WEAPON_PIERCE = 11;
export const WEAPON_SUCTION = 12;
export const WEAPON_CHOP = 13;
export const WEAPON_SLING = 14;
export const WEAPON_CROSSBOW = 15;

// ============================================================================
// AREA_* - Area flags
// ============================================================================

export const AREA_NEWFORMAT = 1;
export const AREA_HIDDEN = 2;
export const AREA_GUILD = 4;
export const AREA_LAWFUL = 8;
export const AREA_WILDERNESS = 16;
export const AREA_UNDERGROUND = 32;
export const AREA_NEWRESET = 64;
export const AREA_BATTLEGROUND = 1024;
export const AREA_ROTHOLHA_FIELD = 2048;
export const AREA_DELAYED_RESET = 4096;

export const AFLAG_DONT_SET = AREA_BATTLEGROUND | AREA_DELAYED_RESET | AREA_ROTHOLHA_FIELD;

// ============================================================================
// ============================================================================
// DOOR_* - Door reset states
// ============================================================================

export const DOOR_NOT_RESET = -1;
export const DOOR_OPEN_UNLOCKED = 0;
export const DOOR_CLOSED_UNLOCKED = 1;
export const DOOR_CLOSED_LOCKED = 2;
export const DOOR_BASHED = 3;

export const MAX_DIR = 5;

// ============================================================================
// EX_* - Exit flags
// ============================================================================

export const EX_ISDOOR = 1;
export const EX_CLOSED = 2;
export const EX_LOCKED = 4;
export const EX_BASHED = 8;
export const EX_BASHPROOF = 16;
export const EX_PICKPROOF = 32;
export const EX_PASSPROOF = 64;
export const EX_HIDDEN = 128;
export const EX_NOUN_MALE = 256;
export const EX_WINDOW = 512;
export const EX_HEAVY = 1024;
export const EX_COMPLEX = 2048;

export const EFLAG_DONT_SET = EX_CLOSED | EX_LOCKED | EX_BASHED;
export const EFLAG_FOR_DOOR = EX_ISDOOR | EX_CLOSED | EX_LOCKED | EX_BASHED |
    EX_BASHPROOF | EX_PICKPROOF | EX_PASSPROOF |
    EX_HIDDEN | EX_NOUN_MALE | EX_WINDOW | EX_HEAVY | EX_COMPLEX;

// ============================================================================
// WEAR_* - Wear locations
// ============================================================================

export const WEAR_NONE = -1;
export const WEAR_LIGHT = 0;
export const WEAR_FINGER_L = 1;
export const WEAR_FINGER_R = 2;
export const WEAR_NECK_1 = 3;
export const WEAR_NECK_2 = 4;
export const WEAR_BODY = 5;
export const WEAR_HEAD = 6;
export const WEAR_LEGS = 7;
export const WEAR_FEET = 8;
export const WEAR_HANDS = 9;
export const WEAR_ARMS = 10;
export const WEAR_SHIELD = 11;
export const WEAR_ABOUT = 12;
export const WEAR_WAIST = 13;
export const WEAR_WRIST_L = 14;
export const WEAR_WRIST_R = 15;
export const WEAR_WIELD = 16;
export const WEAR_HOLD = 17;
export const WEAR_WIELD_2 = 18;
export const WEAR_EYES = 19;
export const WEAR_SHOULDERS = 20;
export const WEAR_EARS = 21;
export const WEAR_FOREHEAD = 22;
export const WEAR_CHEST = 23;
export const WEAR_SIDE_L = 24;
export const WEAR_SIDE_R = 25;

// ============================================================================
// CLASS_* - Character classes
// ============================================================================

export const CLASS_NONE = 0;
export const CLASS_MAGE = 1;
export const CLASS_CLERIC = 2;
export const CLASS_THIEF = 3;
export const CLASS_WARRIOR = 4;
export const CLASS_PSIONIC = 5;
export const CLASS_ASCETIC = 6;
export const CLASS_BARD = 7;
export const CLASS_WANDERER = 8;
export const CLASS_FORESTER = 9;
export const CLASS_CRUSADER = 10;
export const CLASS_MERCENARY = 11;
export const CLASS_TEMPLAR = 12;
export const CLASS_NINJA = 13;
export const CLASS_RANGER = 14;
export const CLASS_ARCANE = 15;

// ============================================================================
// ROOM_* - Room flags
// ============================================================================

export const ROOM_DARK = 1;
export const ROOM_NO_MOB = 4;
export const ROOM_INDOORS = 8;
export const ROOM_UNDERGROUND = 16;
export const ROOM_NO_TELEPORT = 128;
export const ROOM_FOGGY = 256;
export const ROOM_PRIVATE = 512;
export const ROOM_SAFE = 1024;
export const ROOM_SOLITARY = 2048;
export const ROOM_PET_SHOP = 4096;
export const ROOM_NO_RECALL = 8192;
export const ROOM_CONE_OF_SILENCE = 16384;
export const ROOM_SAVEROOM = 32768;
export const ROOM_DEATHTRAP = 65536;
export const ROOM_NO_COMBAT = 131072;
export const ROOM_MINI_SAVE = 262144;
export const ROOM_THEATER = 524288;
export const ROOM_SEATS = 1048576;

export const ROOM_MASK =
    ROOM_DARK | ROOM_NO_MOB | ROOM_INDOORS | ROOM_UNDERGROUND |
    ROOM_NO_TELEPORT | ROOM_FOGGY | ROOM_PRIVATE |
    ROOM_SAFE | ROOM_SOLITARY | ROOM_PET_SHOP | ROOM_NO_RECALL |
    ROOM_CONE_OF_SILENCE | ROOM_SAVEROOM | ROOM_DEATHTRAP |
    ROOM_NO_COMBAT | ROOM_MINI_SAVE | ROOM_THEATER | ROOM_SEATS;

export const RFLAG_DONT_SET = 0;

// ============================================================================
// SECT_* - Sector types
// ============================================================================

export const SECT_INSIDE = 0;
export const SECT_CITY = 1;
export const SECT_FIELD = 2;
export const SECT_FOREST = 3;
export const SECT_HILLS = 4;
export const SECT_MOUNTAIN = 5;
export const SECT_WATER_POOL = 6;
export const SECT_WATER_SWIM = 7;
export const SECT_UNDERWATER = 8;
export const SECT_AIR = 9;
export const SECT_DESERT = 10;
export const SECT_WATER_NOSWIM = 11;
export const SECT_SWAMP = 12;
export const SECT_ROAD = 13;

// ============================================================================
// FURNITURE_* - Furniture interaction flags
// ============================================================================

export const FURNITURE_SLEEP_ON = 1;
export const FURNITURE_REST_ON = 2;
export const FURNITURE_SIT_ON = 4;
export const FURNITURE_STAND_ON = 8;

// ============================================================================
// TTRAP_* - Trap type flags
// ============================================================================

export const TTRAP_BROKEN = 1;
export const TTRAP_DISARMED = 2;
export const TTRAP_OBJ = 4;
export const TTRAP_DOOR = 8;
export const TTRAP_DIR = 16;
export const TTRAP_DIR_NORTH = 32;
export const TTRAP_DIR_EAST = 64;
export const TTRAP_DIR_SOUTH = 128;
export const TTRAP_DIR_WEST = 256;
export const TTRAP_DIR_UP = 512;
export const TTRAP_DIR_DOWN = 1024;

// ============================================================================
// DTRAP_* - Trap damage types
// ============================================================================

export const DTRAP_NONE = 0;
export const DTRAP_FIRE = 1;
export const DTRAP_COLD = 2;
export const DTRAP_ACID = 3;
export const DTRAP_GAS = 4;
export const DTRAP_POISON = 5;
export const DTRAP_SLEEP = 6;
export const DTRAP_PARALYSIS = 7;
export const DTRAP_CUSTOM = 8;

export const LOOKUPNOTFOUND = -10000;

// ============================================================================
// Lookup Tables
// ============================================================================

export const actName = [
    "Mob",                           // 1
    "Sentinella",                    // 2
    "Raccoglie oggetti",             // 4
    "Protetto dalla legge",          // 8
    "Cacciatore",                    // 16
    "Aggressivo",                    // 32
    "Resta nell'area",               // 64
    "Vigliacco",                     // 128
    "Cucciolo",                      // 256
    "Allenatore",                    // 512
    "Maestro di Gilda",              // 1024
    "Croupier",                      // 2048
    "Vendicativo",                   // 4096
    "Pacifico",                      // 8192
    "Guardia",                       // 16384
    "",                              // 32768
    "",                              // 65536
    "In movimento",                  // 131072
    "",                              // 262144
    "",                              // 524288
    "",                              // 1048576
    "",                              // 2097152
    "",                              // 4194304
    "",                              // 8388608
    "",                              // 16777216
    "",                              // 33554432
    "",                              // 67108864
    "",                              // 134217728
    "",                              // 268435456
    "Salva il mob",                  // 536870912
    "Speciale",                      // 1073741824
    "",                              // 2147483648
];

export const affName = [
    "Cieco",                         // 1
    "Invisibile",                    // 2
    "Individua Male",                // 4
    "Individua Invisibile",          // 8
    "Individua Magia",               // 16
    "Individua Nascosto",            // 32
    "Bloccato",                      // 64
    "Sanctuary",                     // 128
    "Faerie Fire",                   // 256
    "Infravisione",                  // 512
    "Maledetto",                     // 1024
    "Cambiato di Sesso",             // 2048
    "Avvelenato",                    // 4096
    "Protetto dal male",             // 8192
    "Cambiato di Razza",             // 16384
    "Si Muove in Silenzio",          // 32768
    "Nascosto",                      // 65536
    "Addormentato (magia)",          // 131072
    "Charmato",                      // 262144
    "Vola",                          // 524288
    "Passa Porte",                   // 1048576
    "",                              // 2097152
    "E' un monsum",                  // 4194304
    "Muto",                          // 8388608
    "Respira sott'acqua",            // 16777216
    "Morso da un Vampiro",           // 33554432
    "Fantasma",                      // 67108864
    "Scudo di Fiamme",               // 134217728
    "Mortalmente avvelenato",        // 268435456
    "",                              // 536870912
    "Pietrificato",                  // 1073741824
    "",                              // 2147483648
];

export const sexName = [
    { number: SEX_NEUTRAL, name: "Neutro" },
    { number: SEX_MALE,    name: "Maschio" },
    { number: SEX_FEMALE,  name: "Femmina" },
];

export const itemTypeName = [
    { number: ITEM_ARMOR,       name: "Armatura" },
    { number: ITEM_WEAPON,      name: "Arma" },
    { number: ITEM_WAND,        name: "Bacchetta" },
    { number: ITEM_STAFF,       name: "Bastone" },
    { number: ITEM_BOAT,        name: "Barca" },
    { number: ITEM_DRINK_CON,   name: "Bevanda" },
    { number: ITEM_TARGET,      name: "Bersaglio" },
    { number: ITEM_PAPER,       name: "Carta" },
    { number: ITEM_KEY,         name: "Chiave" },
    { number: ITEM_FOOD,        name: "Cibo" },
    { number: ITEM_WARSOUND,    name: "Corno" },
    { number: ITEM_BUILDING,    name: "Costruzione" },
    { number: ITEM_CORPSE_PC,   name: "Corpo PC" },
    { number: ITEM_CORPSE_NPC,  name: "Corpo NPC" },
    { number: ITEM_CONTAINER,   name: "Contenitore" },
    { number: ITEM_QUIVER,      name: "Faretra" },
    { number: ITEM_LIGHT,       name: "Fonte di luce" },
    { number: ITEM_FOUNTAIN,    name: "Fontana" },
    { number: ITEM_SCABBARD,    name: "Fodero" },
    { number: ITEM_BOOK,        name: "Libro" },
    { number: ITEM_MONEY,       name: "Monete" },
    { number: ITEM_FURNITURE,   name: "Mobilio" },
    { number: ITEM_SCROLL,      name: "Pergamena" },
    { number: ITEM_PILL,        name: "Pillola" },
    { number: ITEM_PORTAL,      name: "Portale" },
    { number: ITEM_POTION,      name: "Pozione" },
    { number: ITEM_PROJECTILE,  name: "Proiettile" },
    { number: ITEM_TRASH,       name: "Spazzatura" },
    { number: ITEM_STATUE,      name: "Statua" },
    { number: ITEM_INSTRUMENT,  name: "Strumento musicale" },
    { number: ITEM_TREASURE,    name: "Tesoro" },
    { number: ITEM_CAMERA,      name: "Telecamera" },
    { number: ITEM_TRAP,        name: "Trappola" },
];

export const itemExtraFlagsName = [
    "Luminoso",                     // 1
    "Rumoroso",                     // 2
    "Scuro",                        // 4
    "Bloccato",                     // 8
    "Malvagio",                     // 16
    "Invisibile",                   // 32
    "Magico",                       // 64
    "Non lasciabile",               // 128
    "Benedetto",                    // 256
    "Anti Buoni",                   // 512
    "Anti Malvagi",                 // 1024
    "Anti Neutrali",                // 2048
    "Non rimuovibile",              // 4096
    "Inventario",                   // 8192
    "Avvelenato",                   // 16384
    "Scaccia Vampiri",              // 32768
    "Sacro",                        // 65536
    "Puo' Lanciare",                // 131072
    "Puo' essere Lanciato",         // 262144
    "Puo' essere Tirato",           // 524288
    "Torna Indietro",               // 1048576
    "Avvelenato Mortalmente",       // 2097152
    "Raro (Unico)",                 // 4194304
    "Puo' uscire dal gioco",        // 8388608
    "Nascosto",                     // 16777216
    "",                             // 33554432
    "Immortale",                    // 67108864
    "",                             // 134217728
    "",                             // 268435456
    "",                             // 536870912
    "",                             // 1073741824
    "",                             // 2147483648
];

export const itemWearFlagsName = [
    "Puo' essere raccolto",         // 1
    "Alle Dita",                    // 2
    "Al Collo",                     // 4
    "Sul Corpo",                    // 8
    "Sulla Testa",                  // 16
    "Sulle Gambe",                  // 32
    "Ai Piedi",                     // 64
    "Sulle Mani",                   // 128
    "Sulle Braccia",                // 256
    "Come Scudo",                   // 512
    "Attorno al Corpo",             // 1024
    "Alla Vita",                    // 2048
    "Sui Polsi",                    // 4096
    "Come Arma",                    // 8192
    "In Mano",                      // 16384
    "Sugli Occhi",                  // 32768
    "Sulle Spalle",                 // 65536
    "Alle Orecchie",                // 131072
    "Sulla Fronte",                 // 262144
    "Appuntato sul Petto",          // 524288
    "Appeso al Fianco",             // 1048576
    "",                             // 2097152
    "",                             // 4194304
    "",                             // 8388608
    "",                             // 16777216
    "",                             // 33554432
    "",                             // 67108864
    "",                             // 134217728
    "",                             // 268435456
    "",                             // 536870912
    "",                             // 1073741824
    "",                             // 2147483648
];

export const applyName = [
    { number: APPLY_STR,         name: "Forza" },
    { number: APPLY_DEX,         name: "Destrezza" },
    { number: APPLY_INT,         name: "Intelligenza" },
    { number: APPLY_WIS,         name: "Saggezza" },
    { number: APPLY_CON,         name: "Costituzione" },
    { number: APPLY_SEX,         name: "Sesso" },
    { number: APPLY_AGE,         name: "Eta'" },
    { number: APPLY_MANA,        name: "Punti Mana" },
    { number: APPLY_HIT,         name: "Punti Ferita" },
    { number: APPLY_MOVE,        name: "Punti Movimento" },
    { number: APPLY_AC,          name: "Classe Armatura" },
    { number: APPLY_HITROLL,     name: "Bonus a Colpire" },
    { number: APPLY_DAMROLL,     name: "Bonus a Ferire" },
    { number: APPLY_SAVING_PARA, name: "Ts paralisi" },
    { number: APPLY_SAVING_ROD,  name: "Ts bastoni" },
    { number: APPLY_SAVING_PETRI,name: "Ts pietrificazione" },
    { number: APPLY_SAVING_BREATH,name: "Ts soffio" },
    { number: APPLY_SAVING_SPELL,name: "Ts incantesimi" },
    { number: APPLY_RACE,        name: "Razza" },
    { number: APPLY_SNEAK,       name: "Sneak" },
    { number: APPLY_HIDE,        name: "Hide" },
];

export const itemValues = [
    {
        itemType: ITEM_LIGHT,
        descr: ["", "", "Durata (Ore)", ""],
        type: [VALUE_IS_UNUSED, VALUE_IS_UNUSED, VALUE_IS_LIGHT, VALUE_IS_UNUSED]
    },
    {
        itemType: ITEM_SCROLL,
        descr: ["Livello", "Magia 1", "Magia 2", "Magia 3"],
        type: [VALUE_IS_NUMBER_FROM_0, VALUE_IS_SPELL, VALUE_IS_SPELL, VALUE_IS_SPELL]
    },
    {
        itemType: ITEM_WAND,
        descr: ["Livello", "Max Cariche", "Cur Cariche", "Magia"],
        type: [VALUE_IS_NUMBER_FROM_0, VALUE_IS_NUMBER_FROM_0, VALUE_IS_NUMBER_FROM_0, VALUE_IS_SPELL]
    },
    {
        itemType: ITEM_STAFF,
        descr: ["Livello", "Max Cariche", "Cur Cariche", "Magia"],
        type: [VALUE_IS_NUMBER_FROM_0, VALUE_IS_NUMBER_FROM_0, VALUE_IS_NUMBER_FROM_0, VALUE_IS_SPELL]
    },
    {
        itemType: ITEM_WEAPON,
        descr: ["Max Distanza", "", "", "Tipo"],
        type: [VALUE_IS_NUMBER_FROM_0, VALUE_IS_UNUSED, VALUE_IS_UNUSED, VALUE_IS_WEAPON]
    },
    {
        itemType: ITEM_INSTRUMENT,
        descr: ["Livello", "Max Cariche", "Cur Cariche", "Magia"],
        type: [VALUE_IS_NUMBER_FROM_0, VALUE_IS_NUMBER_FROM_0, VALUE_IS_NUMBER_FROM_0, VALUE_IS_SPELL]
    },
    {
        itemType: ITEM_STATUE,
        descr: ["", "", "", ""],
        type: [VALUE_IS_UNUSED, VALUE_IS_UNUSED, VALUE_IS_UNUSED, VALUE_IS_UNUSED]
    },
    {
        itemType: ITEM_TREASURE,
        descr: ["Valore", "", "", ""],
        type: [VALUE_IS_NUMBER_FROM_0, VALUE_IS_UNUSED, VALUE_IS_UNUSED, VALUE_IS_UNUSED]
    },
    {
        itemType: ITEM_ARMOR,
        descr: ["AC base", "", "", ""],
        type: [VALUE_IS_NUMBER, VALUE_IS_UNUSED, VALUE_IS_UNUSED, VALUE_IS_UNUSED]
    },
    {
        itemType: ITEM_POTION,
        descr: ["Livello", "Magia 1", "Magia 2", "Magia 3"],
        type: [VALUE_IS_NUMBER_FROM_0, VALUE_IS_SPELL, VALUE_IS_SPELL, VALUE_IS_SPELL]
    },
    {
        itemType: ITEM_FURNITURE,
        descr: ["Posizioni", "Max. Occupanti", "Max. Capienza", ""],
        type: [VALUE_IS_FURNITURE_FLAGS, VALUE_IS_NUMBER, VALUE_IS_NUMBER, VALUE_IS_UNUSED]
    },
    {
        itemType: ITEM_TRASH,
        descr: ["", "", "", ""],
        type: [VALUE_IS_UNUSED, VALUE_IS_UNUSED, VALUE_IS_UNUSED, VALUE_IS_UNUSED]
    },
    {
        itemType: ITEM_SCABBARD,
        descr: ["Arma", "Arma", "Arma", "Arma"],
        type: [VALUE_IS_WEAPON, VALUE_IS_WEAPON, VALUE_IS_WEAPON, VALUE_IS_WEAPON]
    },
    {
        itemType: ITEM_CONTAINER,
        descr: ["Capacita'", "Tipo", "Chiave", ""],
        type: [VALUE_IS_NUMBER_FROM_0, VALUE_IS_CONTAINER_FLAGS, VALUE_IS_VNUM, VALUE_IS_UNUSED]
    },
    {
        itemType: ITEM_QUIVER,
        descr: ["Capacita'", "", "", ""],
        type: [VALUE_IS_NUMBER_FROM_0, VALUE_IS_UNUSED, VALUE_IS_UNUSED, VALUE_IS_UNUSED]
    },
    {
        itemType: ITEM_DRINK_CON,
        descr: ["Capacita'", "Quantita'", "Tipo", "Avvelenato"],
        type: [VALUE_IS_NUMBER_FROM_0, VALUE_IS_NUMBER_FROM_0, VALUE_IS_LIQUID, VALUE_IS_POISON]
    },
    {
        itemType: ITEM_KEY,
        descr: ["", "", "", ""],
        type: [VALUE_IS_UNUSED, VALUE_IS_UNUSED, VALUE_IS_UNUSED, VALUE_IS_UNUSED]
    },
    {
        itemType: ITEM_FOOD,
        descr: ["Sfama per (Ore)", "", "", "Avvelenato"],
        type: [VALUE_IS_NUMBER, VALUE_IS_UNUSED, VALUE_IS_UNUSED, VALUE_IS_POISON]
    },
    {
        itemType: ITEM_MONEY,
        descr: ["Quantita'", "", "", ""],
        type: [VALUE_IS_NUMBER_FROM_0, VALUE_IS_UNUSED, VALUE_IS_UNUSED, VALUE_IS_UNUSED]
    },
    {
        itemType: ITEM_WARSOUND,
        descr: ["", "", "", ""],
        type: [VALUE_IS_UNUSED, VALUE_IS_UNUSED, VALUE_IS_UNUSED, VALUE_IS_UNUSED]
    },
    {
        itemType: ITEM_BOAT,
        descr: ["", "", "", ""],
        type: [VALUE_IS_UNUSED, VALUE_IS_UNUSED, VALUE_IS_UNUSED, VALUE_IS_UNUSED]
    },
    {
        itemType: ITEM_CORPSE_NPC,
        descr: ["", "", "", ""],
        type: [VALUE_IS_UNUSED, VALUE_IS_UNUSED, VALUE_IS_UNUSED, VALUE_IS_UNUSED]
    },
    {
        itemType: ITEM_CORPSE_PC,
        descr: ["", "", "", ""],
        type: [VALUE_IS_UNUSED, VALUE_IS_UNUSED, VALUE_IS_UNUSED, VALUE_IS_UNUSED]
    },
    {
        itemType: ITEM_FOUNTAIN,
        descr: ["", "", "", ""],
        type: [VALUE_IS_UNUSED, VALUE_IS_UNUSED, VALUE_IS_UNUSED, VALUE_IS_UNUSED]
    },
    {
        itemType: ITEM_PILL,
        descr: ["Livello", "Magia 1", "Magia 2", "Magia 3"],
        type: [VALUE_IS_NUMBER_FROM_0, VALUE_IS_SPELL, VALUE_IS_SPELL, VALUE_IS_SPELL]
    },
    {
        itemType: ITEM_PROJECTILE,
        descr: ["Tipo di arma", "", "", ""],
        type: [VALUE_IS_WEAPON, VALUE_IS_UNUSED, VALUE_IS_UNUSED, VALUE_IS_UNUSED]
    },
    {
        itemType: ITEM_BUILDING,
        descr: ["Locazione", "Porta", "Chiave", "Serratura"],
        type: [VALUE_IS_VNUM, VALUE_IS_NUMBER, VALUE_IS_VNUM, VALUE_IS_CONTAINER_FLAGS]
    },
    {
        itemType: ITEM_PORTAL,
        descr: ["Locazione", "", "", ""],
        type: [VALUE_IS_VNUM, VALUE_IS_UNUSED, VALUE_IS_UNUSED, VALUE_IS_UNUSED]
    },
    {
        itemType: ITEM_CAMERA,
        descr: ["Locazione", "Locazione", "Locazione", "Locazione"],
        type: [VALUE_IS_VNUM, VALUE_IS_VNUM, VALUE_IS_VNUM, VALUE_IS_VNUM]
    },
    {
        itemType: ITEM_TRAP,
        descr: ["Tipo", "Tipo di danno", "Cariche", "Danno"],
        type: [VALUE_IS_TRAPTYPE, VALUE_IS_TRAPDAMAGE, VALUE_IS_LIGHT, VALUE_IS_NUMBER_FROM_0]
    },
    {
        itemType: ITEM_PAPER,
        descr: ["", "", "", ""],
        type: [VALUE_IS_UNUSED, VALUE_IS_UNUSED, VALUE_IS_UNUSED, VALUE_IS_UNUSED]
    },
    {
        itemType: ITEM_BOOK,
        descr: ["", "", "", ""],
        type: [VALUE_IS_UNUSED, VALUE_IS_UNUSED, VALUE_IS_UNUSED, VALUE_IS_UNUSED]
    },
    {
        itemType: ITEM_TARGET,
        descr: ["Distanza (metri)", "", "", ""],
        type: [VALUE_IS_NUMBER_FROM_0, VALUE_IS_UNUSED, VALUE_IS_UNUSED, VALUE_IS_UNUSED]
    },
];

export const itemWeaponName = [
    { number: WEAPON_HIT,      name: "Hit" },
    { number: WEAPON_SLICE,    name: "Slice" },
    { number: WEAPON_STAB,     name: "Stab" },
    { number: WEAPON_SLASH,    name: "Slash" },
    { number: WEAPON_WHIP,     name: "Whip" },
    { number: WEAPON_CLAW,     name: "Claw" },
    { number: WEAPON_BOW,      name: "Bow" },
    { number: WEAPON_POUND,    name: "Pound" },
    { number: WEAPON_CRUSH,    name: "Crush" },
    { number: WEAPON_GREP,     name: "Grep" },
    { number: WEAPON_BITE,     name: "Bite" },
    { number: WEAPON_PIERCE,   name: "Pierce" },
    { number: WEAPON_SUCTION,  name: "Suction" },
    { number: WEAPON_CHOP,     name: "Chop" },
    { number: WEAPON_SLING,    name: "Sling" },
    { number: WEAPON_CROSSBOW, name: "Crossbow" },
];

export const itemContainerFlagsName = [
    { number: 0,  name: "Normale" },
    { number: 1,  name: "Chiudibile" },
    { number: 4,  name: "Chiuso" },
    { number: 5,  name: "Chiudibile + Chiuso" },
    { number: 9,  name: "Chiudibile + Bloccato" },
    { number: 11, name: "Chiudibile + Non Forzabile + Bloccato" },
    { number: 13, name: "Chiudibile + Chiuso + Bloccato" },
    { number: 15, name: "Chiudibile + Non Forzabile + Chiuso + Bloccato" },
];

export const itemLiquidName = [
    { number: 0,  name: "Acqua" },
    { number: 1,  name: "Birra" },
    { number: 2,  name: "Vino" },
    { number: 3,  name: "Birra Scura" },
    { number: 4,  name: "Succo di Frutta" },
    { number: 5,  name: "Whisky" },
    { number: 6,  name: "Limonata" },
    { number: 7,  name: "FireBreather" },
    { number: 8,  name: "Specialita' locale" },
    { number: 9,  name: "Mucillaggine" },
    { number: 10, name: "Latte" },
    { number: 11, name: "The" },
    { number: 12, name: "Caffe'" },
    { number: 13, name: "Sangue" },
    { number: 14, name: "Acqua Salata" },
    { number: 15, name: "Cola" },
    { number: 16, name: "Idromele" },
];

export const itemPoisonName = [
    { number: -1, name: "Mortale" },
    { number: 0,  name: "No" },
    { number: 1,  name: "Si" },
];

export const itemFurnitureFlagsName = [
    { number: 0,  name: "Non utilizzabile" },
    { number: FURNITURE_SIT_ON,  name: "Sedere" },
    { number: FURNITURE_REST_ON,  name: "Riposare" },
    { number: FURNITURE_SIT_ON | FURNITURE_REST_ON,  name: "Sedere + Riposare" },
    { number: FURNITURE_STAND_ON,  name: "In piedi" },
    { number: FURNITURE_SIT_ON | FURNITURE_STAND_ON,  name: "Sedere + In piedi" },
    { number: FURNITURE_REST_ON | FURNITURE_SLEEP_ON,  name: "Riposare + Dormire" },
    { number: FURNITURE_SIT_ON | FURNITURE_REST_ON | FURNITURE_SLEEP_ON,  name: "Sedere + Riposare + Dormire" },
];

export const itemTrapType = [
    { number: 0,                              name: "Inutile" },
    { number: TTRAP_BROKEN,                   name: "Rotta" },
    { number: TTRAP_DISARMED,                 name: "Disinnescata" },
    { number: TTRAP_OBJ,                      name: "In un oggetto" },
    { number: TTRAP_DIR | TTRAP_DIR_NORTH,    name: "In direzione Nord" },
    { number: TTRAP_DIR | TTRAP_DIR_EAST,     name: "In direzione Est" },
    { number: TTRAP_DIR | TTRAP_DIR_SOUTH,    name: "In direzione Sud" },
    { number: TTRAP_DIR | TTRAP_DIR_WEST,     name: "In direzione Ovest" },
    { number: TTRAP_DIR | TTRAP_DIR_UP,       name: "In direzione Alto" },
    { number: TTRAP_DIR | TTRAP_DIR_DOWN,     name: "In direzione Basso" },
    { number: TTRAP_DOOR | TTRAP_DIR_NORTH,   name: "Su una porta Nord" },
    { number: TTRAP_DOOR | TTRAP_DIR_EAST,    name: "Su una porta Est" },
    { number: TTRAP_DOOR | TTRAP_DIR_SOUTH,   name: "Su una porta Sud" },
    { number: TTRAP_DOOR | TTRAP_DIR_WEST,    name: "Su una porta Ovest" },
    { number: TTRAP_DOOR | TTRAP_DIR_UP,      name: "Su una porta Alto" },
    { number: TTRAP_DOOR | TTRAP_DIR_DOWN,    name: "Su una porta Basso" },
];

export const itemTrapDamage = [
    { number: DTRAP_NONE,       name: "E' un allarme" },
    { number: DTRAP_FIRE,       name: "Fuoco" },
    { number: DTRAP_COLD,       name: "Ghiaccio" },
    { number: DTRAP_ACID,       name: "Acido" },
    { number: DTRAP_GAS,        name: "Gas" },
    { number: DTRAP_POISON,     name: "Veleno" },
    { number: DTRAP_SLEEP,      name: "Sonno" },
    { number: DTRAP_PARALYSIS,  name: "Paralisi" },
    { number: DTRAP_CUSTOM,     name: "Custom" },
];

export const areaFlagsName = [
    "Nuovo formato",                // 1
    "Nascosta",                     // 2
    "Gilda",                        // 4
    "Legale",                       // 8
    "Wilderness",                   // 16
    "Sotterranea",                  // 32
    "Nuovi Reset",                  // 64
    "",                             // 128
    "",                             // 256
    "",                             // 512
    "Campo di Battaglia",           // 1024
    "Campo Rotholha",               // 2048
    "Reset Ritardato",              // 4096
];

export const roomFlagsName = [
    "Buia",                         // 1
    "",                             // 2
    "Vietata ai Mob",               // 4
    "Interno",                      // 8
    "Sotterranea",                  // 16
    "",                             // 32
    "NO Teleport",                  // 64
    "Nebbiosa",                     // 128
    "NO Summon",                    // 256
    "Privata",                      // 512
    "Sicura",                       // 1024
    "Solitaria",                    // 2048
    "Negozio di Animali",           // 4096
    "NO Ritorno",                   // 8192
    "Cone Of Silence",              // 16384
    "Deposito",                     // 32768
    "Trappola Mortale",             // 65536
    "NO Combattimento",             // 131072
    "Deposito contenitori",         // 262144
    "Teatro",                       // 524288
    "Spalti",                       // 1048576
];

export const sectTypeName = [
    { number: SECT_INSIDE,      name: "Interno" },
    { number: SECT_CITY,        name: "Citta'" },
    { number: SECT_FIELD,       name: "Campo" },
    { number: SECT_FOREST,      name: "Foresta" },
    { number: SECT_HILLS,       name: "Collina" },
    { number: SECT_MOUNTAIN,    name: "Montagna" },
    { number: SECT_WATER_POOL,  name: "Acqua Bassa" },
    { number: SECT_WATER_SWIM,  name: "Acqua Profonda" },
    { number: SECT_UNDERWATER,  name: "Sott'acqua" },
    { number: SECT_AIR,         name: "In Aria" },
    { number: SECT_DESERT,      name: "Deserto" },
    { number: SECT_WATER_NOSWIM,name: "Oceano" },
    { number: SECT_SWAMP,       name: "Palude" },
    { number: SECT_ROAD,        name: "Strada" },
];



export const doorResetName = [
    { number: DOOR_NOT_RESET,        name: "Non resettata" },
    { number: DOOR_OPEN_UNLOCKED,    name: "Aperta" },
    { number: DOOR_CLOSED_UNLOCKED,  name: "Chiusa" },
    { number: DOOR_CLOSED_LOCKED,    name: "Chiusa e bloccata" },
    { number: DOOR_BASHED,            name: "Sfondata" },
];

export const exitFlagsName = [
    { value: EX_ISDOOR,     label: "E' una porta" },
    { value: EX_CLOSED,     label: "Chiusa" },
    { value: EX_LOCKED,     label: "Bloccata" },
    { value: EX_BASHED,     label: "Sfondata" },
    { value: EX_BASHPROOF,  label: "Non sfondabile" },
    { value: EX_PICKPROOF,  label: "Non forzabile" },
    { value: EX_PASSPROOF,  label: "Non attraversabile" },
    { value: EX_HIDDEN,     label: "Nascosta" },
    { value: EX_NOUN_MALE,  label: "Nome maschile" },
    { value: EX_WINDOW,     label: "E' una finestra" },
    { value: EX_HEAVY,      label: "Resistente" },
    { value: EX_COMPLEX,    label: "Serr. Complessa" },
];

export const wearName = [
    { number: WEAR_NONE,       name: "in INVENTARIO" },
    { number: WEAR_LIGHT,      name: "come Luce" },
    { number: WEAR_FINGER_L,   name: "al Dito Sinistro" },
    { number: WEAR_FINGER_R,   name: "al Dito Destro" },
    { number: WEAR_NECK_1,     name: "al Collo (1)" },
    { number: WEAR_NECK_2,     name: "al Collo (2)" },
    { number: WEAR_BODY,       name: "sul Corpo" },
    { number: WEAR_HEAD,       name: "sulla Testa" },
    { number: WEAR_LEGS,       name: "sulle Gambe" },
    { number: WEAR_FEET,       name: "ai Piedi" },
    { number: WEAR_HANDS,      name: "sulle Mani" },
    { number: WEAR_ARMS,       name: "sulle Braccia" },
    { number: WEAR_SHIELD,     name: "come Scudo" },
    { number: WEAR_ABOUT,      name: "attorno al Corpo" },
    { number: WEAR_WAIST,      name: "alla Vita" },
    { number: WEAR_WRIST_L,    name: "al Polso Sinistro" },
    { number: WEAR_WRIST_R,    name: "al Polso Destro" },
    { number: WEAR_WIELD,      name: "come Arma Principale" },
    { number: WEAR_HOLD,       name: "in Mano" },
    { number: WEAR_WIELD_2,    name: "come Arma Secondaria" },
    { number: WEAR_EYES,       name: "sugli Occhi" },
    { number: WEAR_SHOULDERS,  name: "sulle Spalle" },
    { number: WEAR_EARS,       name: "alle Orecchie" },
    { number: WEAR_FOREHEAD,   name: "sulla Fronte" },
    { number: WEAR_CHEST,      name: "appuntato sul Petto" },
    { number: WEAR_SIDE_L,     name: "al Fianco Sinistro" },
    { number: WEAR_SIDE_R,     name: "al Fianco Destro" },
];

export const guildName = [
    { number: CLASS_NONE,      name: "Nessuna" },
    { number: CLASS_MAGE,      name: "Mago" },
    { number: CLASS_CLERIC,    name: "Chierico" },
    { number: CLASS_THIEF,     name: "Ladro" },
    { number: CLASS_WARRIOR,   name: "Guerriero" },
    { number: CLASS_PSIONIC,   name: "Psionico" },
    { number: CLASS_ASCETIC,   name: "Asceta" },
    { number: CLASS_BARD,      name: "Bardo" },
    { number: CLASS_WANDERER,  name: "Ramingo" },
    { number: CLASS_FORESTER,  name: "Forester" },
    { number: CLASS_CRUSADER,  name: "Crociato" },
    { number: CLASS_MERCENARY, name: "Mercenario" },
    { number: CLASS_TEMPLAR,   name: "Templare" },
    { number: CLASS_NINJA,     name: "Ninja" },
    { number: CLASS_RANGER,    name: "Ranger" },
    { number: CLASS_ARCANE,    name: "Arcano" },
];

export const races = [
    { english: "Animal",      italian: "Animale" },
    { english: "Harpy",       italian: "Arpia" },
    { english: "Kobold",      italian: "Coboldo" },
    { english: "God",         italian: "Dio" },
    { english: "Dragon",      italian: "Drago" },
    { english: "Drow",        italian: "Drow" },
    { english: "Elemental",   italian: "Elementale" },
    { english: "Elf",         italian: "Elfo" },
    { english: "Ghost",       italian: "Fantasma" },
    { english: "Faerie",      italian: "Folletto" },
    { english: "Giant",       italian: "Gigante" },
    { english: "Githyanki",   italian: "Githyanki" },
    { english: "Gnome",       italian: "Gnomo" },
    { english: "Goblin",      italian: "Goblin" },
    { english: "Hobbit",      italian: "Hobbit" },
    { english: "Hobgoblin",   italian: "Hobgoblin" },
    { english: "Hydra",       italian: "Idra" },
    { english: "Insect",      italian: "Insetto" },
    { english: "Lizard",      italian: "Lucertola" },
    { english: "Werewolf",    italian: "Lupo Mannaro" },
    { english: "Halfelf",     italian: "Mezz'Elfo" },
    { english: "Halfkobold",  italian: "Mezzo Coboldo" },
    { english: "Halfdwarf",   italian: "Mezzo Nano" },
    { english: "Mindflayer",  italian: "Mindflayer" },
    { english: "Minotaur",    italian: "Minotauro" },
    { english: "Dwarf",       italian: "Nano" },
    { english: "Mist",        italian: "Nebbia" },
    { english: "Undead",      italian: "Non-Morto" },
    { english: "Object",      italian: "Oggetto" },
    { english: "Orc",         italian: "Orchetto" },
    { english: "Ogre",        italian: "Orco" },
    { english: "Bear",        italian: "Orso" },
    { english: "Fish",        italian: "Pesce" },
    { english: "Plant",       italian: "Pianta" },
    { english: "Bat",         italian: "Pipistrello" },
    { english: "Arachnid",    italian: "Ragno" },
    { english: "Snake",       italian: "Serpente" },
    { english: "Rat",         italian: "Topo" },
    { english: "Troll",       italian: "Troll" },
    { english: "Human",       italian: "Umano" },
    { english: "Vampire",     italian: "Vampiro" },
    { english: "Worm",        italian: "Verme" },
];

export const spells = [
    "",
    "acid blast",
    "acid breath",
    "adrenaline control",
    "agitation",
    "armor",
    "aura sight",
    "awe",
    "ballistic attack",
    "biofeedback",
    "bless",
    "blindness",
    "breathe water",
    "burning hands",
    "call lightning",
    "cause critical",
    "cause light",
    "cause serious",
    "cell adjustment",
    "change sex",
    "charm person",
    "chill touch",
    "colour spray",
    "combat mind",
    "complete healing",
    "cone of silence",
    "continual light",
    "control flames",
    "control weather",
    "create food",
    "create sound",
    "create spring",
    "create water",
    "cure blindness",
    "cure critical",
    "cure light",
    "cure poison",
    "cure serious",
    "curse",
    "death field",
    "destroy cursed",
    "detect evil",
    "detect hidden",
    "detect invis",
    "detect magic",
    "detect poison",
    "detonate",
    "dimensional door",
    "disintegrate",
    "dispel evil",
    "dispel magic",
    "displacement",
    "domination",
    "earthquake",
    "ectoplasmic form",
    "ego whip",
    "enchant weapon",
    "energy containment",
    "energy drain",
    "enhance armor",
    "enhanced strength",
    "exorcise",
    "faerie fire",
    "faerie fog",
    "fear",
    "fire breath",
    "fireball",
    "flamestrike",
    "flaming shield",
    "flesh armor",
    "fly",
    "frost breath",
    "gas breath",
    "gate",
    "general purpose",
    "giant strength",
    "harm",
    "heal",
    "heroes feast",
    "high explosive",
    "identify",
    "immortal revenge",
    "inertial barrier",
    "inflict pain",
    "infravision",
    "intellect fortress",
    "invis",
    "know alignment",
    "lend health",
    "levitation",
    "lightning bolt",
    "lightning breath",
    "locate object",
    "magic missile",
    "mass heal",
    "mass invis",
    "mental barrier",
    "mind thrust",
    "mortal poison",
    "mute",
    "pass door",
    "poison",
    "polymorph other",
    "portal",
    "project force",
    "protection",
    "psionic blast",
    "psychic crush",
    "psychic drain",
    "psychic healing",
    "recharge item",
    "refresh",
    "remove alignment",
    "remove curse",
    "remove silence",
    "sanctuary",
    "share strength",
    "shield",
    "shocking grasp",
    "sleep",
    "stone skin",
    "summon",
    "teleport",
    "thought shield",
    "turn undead",
    "ultrablast",
    "vampiric bite",
    "ventriloquate",
    "weaken",
    "word of recall",
];

export const mobSpecFuncs = [
    "",
    "spec_breath_any",
    "spec_breath_acid",
    "spec_breath_fire",
    "spec_breath_frost",
    "spec_breath_gas",
    "spec_breath_lightning",
    "spec_cast_adept",
    "spec_cast_cleric",
    "spec_cast_ghost",
    "spec_cast_judge",
    "spec_cast_mage",
    "spec_cast_psionicist",
    "spec_cast_undead",
    "spec_cast_anidead",
    "spec_executioner",
    "spec_fido",
    "spec_guard",
    "spec_janitor",
    "spec_mayor",
    "spec_poison",
    "spec_repairman",
    "spec_thief",
    "spec_cast_beholder",
    "spec_cast_medusa",
    "spec_hunter",
    "spec_gate_repair",
    "spec_assassin",
    "spec_bowman",
];

export const objSpecFuncs = [
    "",
    "obj_spec_guillotine",
    "obj_spec_cauldron",
    "obj_spec_event_heroes",
];

export const dirName = ["a NORD", "a EST", "a SUD", "a OVEST", "in ALTO", "in BASSO"];

export const dirSimpleName = ["Nord", "Est", "Sud", "Ovest", "Alto", "Basso"];

export const dirSimpleNameEn = ["north", "east", "south", "west", "up", "down"];

export const planeName = [
    "",
    "Materiale",
    "Classico",
    "Futuro",
    "Esterno",
    "Immortale",
    "Purgatorio",
    "Limbo",
    "Astrale",
    "Scuola",
    "Quest",
];

// ============================================================================
// Data Model Constructors
// ============================================================================

/** @returns {import('./types.js').AreaGeneralData} */
export function createArea() {
    return {
        author: "",
        areaFlags: 0,
        areaMusic: "",
        planeName: "",
        resetMsg: "",
        racMinLev: 0,
        racMaxLev: 0,
        areaName: "",
        recallVNum: 0,
        VNumStart: 1000,

    };
}

/** @returns {import('./types.js').AreaHelps} */
export function createHelp() {
    return {
        level: 0,
        keywords: "",
        text: "",
    };
}

/** @returns {import('./types.js').AreaMobile} */
export function createMobile() {
    return {
        VNum: 0,
        keywords: "nuovo mob",
        shortDescr: "un nuovo mob",
        longDescr: "Un nuovo mob sta vagando smarrito.",
        descr: "Un mob privo di descrizione.",
        actFlags: 0,
        affFlags: 0,
        align: 0,
        level: 1,
        race: "Human",
        sex: 0,
        special: "",
        isShopKeeper: 0,
        buyType: [0, 0, 0, 0, 0],
        profitBuy: 100,
        profitSell: 100,
        openHour: 0,
        closeHour: 23,
        gold: 0,
        guild: CLASS_NONE,
        reputation: 0,
    };
}

/** @returns {import('./types.js').AreaExtraDescr} */
export function createExtraDescr() {
    return {
        keywords: "",
        descr: "",
    };
}

/** @returns {import('./types.js').AreaObjectApplyType} */
export function createApply() {
    return {
        type: 0,
        value: 0,
    };
}

/** @returns {import('./types.js').AreaObject} */
export function createObject() {
    return {
        VNum: 0,
        keywords: "nuovo oggetto",
        shortDescr: "un nuovo oggetto",
        longDescr: "Qui c'e' un nuovo oggetto.",
        action: "",
        type: ITEM_LIGHT,
        extraFlags: 0,
        wearFlags: 0,
        value: [0, 0, 0, 0],
        weight: 0,
        wearAffs: 0,
        cost: 0,
        wearOnMsg: "",
        wearOffMsg: "",
        extraDescr: [],
        applyType: [],
        special: '',
    };
}

/** @returns {import('./types.js').AreaDoor} */
export function createDoor() {
    return {
        VNumTo: -1,
        keywords: "",
        descr: "",
        exitFlags: 0,
        keyVNum: -1,
        resetType: DOOR_NOT_RESET,
    };
}

/** @returns {import('./types.js').AreaLoadedObject} */
export function createLoadedObject() {
    return {
        UniqueId: 0,
        VNum: 0,
        flags: 0,
        contain: [],
        level: -1,
        limit: -1,
    };
}

/** @returns {import('./types.js').AreaMobObject} */
export function createMobObject() {
    return {
        UniqueId: 0,
        VNum: 0,
        contain: [],
        level: -1,
        wearLoc: WEAR_NONE,
        storage: 0,
    };
}

/** @returns {import('./types.js').AreaLoadedMob} */
export function createLoadedMob() {
    return {
        UniqueId: 0,
        VNum: 0,
        limit: -1,
        awake: 0,
        sleep: 0,
        contain: [],
    };
}

/** @returns {import('./types.js').AreaRoom} */
export function createRoom() {
    return {
        resetOnly: 0,
        VNum: 0,
        name: "una stanza vuota",
        descr: "Una stanza piena di rimbombi.",
        flags: 0,
        sectorType: SECT_INSIDE,
        doors: [
            createDoor(), createDoor(), createDoor(),
            createDoor(), createDoor(), createDoor(),
        ],
        extraDescr: [],
        objs: [],
        mobs: [],
        isRandom: 0,
        randomLevel: 0,
    };
}
