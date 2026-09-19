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

export const AREA_NEW_FORMAT = 1;
export const AREA_NEWRESET = 64;
export const AREA_BATTLEGROUND = 1024;

export const AFLAG_DONT_SET = AREA_BATTLEGROUND;

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

// UI-ready flag data arrays with tooltips
// These are used by the forms to create checkbox groups

/** Action flags for mobile editor (excludes ACT_IS_NPC and DONT_SET flags) */
export const actFlagsData = [
    { value: 2, label: 'Sentinel',
      desc: 'Il mobile rimane nella sua assegnata stanza e non vaga. Usato durante il reset dell\'area per mantenere guardi e negozianti al loro posto. (2)' },
    { value: 4, label: 'Scavenger',
      desc: 'Il mobile raccoglie oggetti preziosi da terra e li tiene. Gli scavenger prendono l\'oggetto piu\' prezioso nella stanza. (4)' },
    { value: 8, label: 'To Vindicate',
      desc: 'I giocatori acquisiscono lo status di ricercato quando uccidono questo mobile, e saranno braccati dalle guardie mobili. (8)' },
    { value: 32, label: 'Aggressive',
      desc: 'Il mobile attacca i giocatori a vista senza provocazione. I mob aggressivi inizieranno combattimento quando un giocatore entra nella stanza. (32)' },
    { value: 64, label: 'Stay Area',
      desc: 'Il mobile non lascer\u00e0 la sua area di provenienza durante inseguimenti o vagabondaggi. Impedisce ai mob di seguire i giocatori in altre zone. (64)' },
    { value: 128, label: 'Wimpy',
      desc: 'Il mobile fugge quando \u00e8 gravemente ferito (sotto il 25% di HP). I mob wimpy tenteranno di fuggire dal combattimento. (128)' },
    { value: 512, label: 'Train',
      desc: 'Il mobile pu\u00f2 addestrare i giocatori nelle statistiche (forza, intelligenza, ecc). Gli immortali possono usare il comando \"train\" vicino a questi mob. (512)' },
    { value: 1024, label: 'Practice',
      desc: 'Il mobile \u00e8 un maestro di gilda che pu\u00f2 insegnare abilit\u00e0/incantesimi. I giocatori possono usare il comando \"practice\" vicino a questi mob. (1024)' },
    { value: 2048, label: 'Gamble',
      desc: 'Il mobile gestisce un gioco d\'azzardo (carte, dadi, ecc). I croupier con questo flag possono interagire tra loro. Non utilizzato. (2048)' },
    { value: 4096, label: 'Vindicative',
      desc: 'Il mobile insegue attivamente il giocatore se fugge dal combattimento. (4096)' },
    { value: 8192, label: 'Peaceful',
      desc: 'Il mobile ignora le razze odiate e non attaccher\u00e0 in base all\'odio razziale. I mob pacifici sono esenti dal comportamento di aggro razziale. (8192)' },
    { value: 16384, label: 'Guard',
      desc: 'Il mobile \u00e8 una guardia cittadina. Attacca i criminali (PLR_KILLER, PLR_THIEF) e avverte i giocatori con armi in aree legali. Saluta anche i giocatori con reputazione hero e insulta i villain. (16384)' },
    { value: 536870912, label: 'Save Mob',
      desc: 'I dati del mobile vengono salvati su disco. Usato per NPC persistenti che mantengono il loro stato tra i riavvii (es. negozianti con oro). (536870912)' },
    { value: 1073741824, label: 'Special',
      desc: 'Il mobile ha una funzione speciale che deve essere sempre eseguita, anche se non ci sono giocatori nell\'area (es. sindaco). (1073741824)' }
];

/** Affect flags for mobile editor */
export const affFlagsData = [
    { value: 1, label: 'Blind',
      desc: 'Il personaggio \u00e8 accecato e non pu\u00f2 vedere. Riduce la precisione in combattimento. (1)' },
    { value: 2, label: 'Invisible',
      desc: 'Il personaggio \u00e8 invisibile alla vista normale. Richiede detect invis per essere visto. (2)' },
    { value: 4, label: 'Detect Evil',
      desc: 'Il personaggio pu\u00f2 percepire gli esseri allineati al male. Le creature malvagie brillano di rosso. (4)' },
    { value: 8, label: 'Detect Invis',
      desc: 'Il personaggio pu\u00f2 vedere creature e oggetti invisibili. (8)' },
    { value: 16, label: 'Detect Magic',
      desc: 'Il personaggio pu\u00f2 percepire le aure magiche su oggetti e creature. (16)' },
    { value: 32, label: 'Detect Hidden',
      desc: 'Il personaggio pu\u00f2 rilevare creature nascoste (che si nascondono/furtano). (32)' },
    { value: 64, label: 'Hold',
      desc: 'Il personaggio \u00e8 trattenuto/paralizzato e non pu\u00f2 muoversi o agire. Normalmente impostato solo da abilit\u00e0 di combattimento, usare con cautela. (64)' },
    { value: 128, label: 'Sanctuary',
      desc: 'Il personaggio \u00e8 protetto dal santuario. Tutti i danni vengono dimezzati. (128)' },
    { value: 256, label: 'Faerie Fire',
      desc: 'Il personaggio \u00e8 delineato dalla faerie fire e non pu\u00f2 nascondersi. Rende anche vulnerabile a danni aggiuntivi. (256)' },
    { value: 512, label: 'Infrared',
      desc: 'Il personaggio ha l\'infravisione e pu\u00f2 vedere al buio. (512)' },
    { value: 1024, label: 'Curse',
      desc: 'Il personaggio \u00e8 maledetto. Impedisce il richiamo e riduce le statistiche. (1024)' },
    { value: 4096, label: 'Poison',
      desc: 'Il personaggio \u00e8 avvelenato e subisce danni periodici. (4096)' },
    { value: 8192, label: 'Protect',
      desc: 'Il personaggio \u00e8 protetto dal male. Gli attaccanti malvagi infliggono meno danni. (8192)' },
    { value: 32768, label: 'Sneak',
      desc: 'Il personaggio si muove silenziosamente ed \u00e8 pi\u00f0 difficile da rilevare. I personaggi che si furtano non generano messaggi di movimento. (32768)' },
    { value: 65536, label: 'Hide',
      desc: 'Il personaggio \u00e8 nascosto e non pu\u00f2 essere visto senza detect hidden. Attaccare o muoversi rivela i personaggi nascosti. (65536)' },
    { value: 131072, label: 'Sleep',
      desc: 'Il personaggio \u00e8 magicamente addormentato e non pu\u00f2 agire. Il risveglio richiede danni o un incantesimo di risveglio. (131072)' },
    { value: 262144, label: 'Charm',
      desc: 'Il personaggio \u00e8 incantato e obbedisce alla fonte dell\'incantesimo. I mob incantati seguono il loro padrone; i giocatori incantati perdono parte del controllo. Non impostare mai manualmente. (262144)' },
    { value: 524288, label: 'Flying',
      desc: 'Il personaggio sta volando e pu\u00f2 attraversare acque/baratri. Fornisce anche l\'immunit\u00e0 alle trappole a terra. (524288)' },
    { value: 1048576, label: 'Pass Door',
      desc: 'Il personaggio pu\u00f2 attraversare porte chiuse e muri. (1048576)' },
    { value: 2097152, label: 'Waterwalk',
      desc: '[NON UTILIZZATO] Contrassegnato come non utilizzato nel codice sorgente. (2097152)' },
    { value: 8388608, label: 'Mute',
      desc: 'Il personaggio non pu\u00f2 lanciare incantesimi verbali o parlare. Blocca tutti gli incantesimi che richiedono componenti verbali. (8388608)' },
    { value: 16777216, label: 'Gills',
      desc: 'Il personaggio pu\u00f2 respirare sott\u2019acqua senza affogare. (16777216)' },
    { value: 134217728, label: 'Flaming',
      desc: 'Il personaggio \u00e8 avvolto dalle fiamme. Infligge danni da fuoco agli attaccanti nel combattimento corpo a corpo. (134217728)' },
    { value: 536870912, label: 'Paralyzed',
      desc: '[NON UTILIZZATO] Contrassegnato come non utilizzato nel codice sorgente. (536870912)' },
    { value: 1073741824, label: 'Petrified',
      desc: 'Il personaggio \u00e8 stato trasformato in pietra (pietrificato). Immobilizza completamente il bersaglio. Pu\u00f2 essere curato con Stone to Flesh. (1073741824)' }
];

/** Worn affliction flags for object editor */
export const wearAffsData = [
    { value: 1, label: 'Blind',
      desc: 'Il personaggio \u00e8 accecato e non pu\u00f2 vedere. Riduce la precisione in combattimento. (1)' },
    { value: 2, label: 'Invisible',
      desc: 'Il personaggio \u00e8 invisibile alla vista normale. Richiede detect invis per essere visto. (2)' },
    { value: 4, label: 'Detect Evil',
      desc: 'Il personaggio pu\u00f2 percepire gli esseri allineati al male. Le creature malvagie brillano di rosso. (4)' },
    { value: 8, label: 'Detect Invis',
      desc: 'Il personaggio pu\u00f2 vedere creature e oggetti invisibili. (8)' },
    { value: 16, label: 'Detect Magic',
      desc: 'Il personaggio pu\u00f2 percepire le aure magiche su oggetti e creature. (16)' },
    { value: 32, label: 'Detect Hidden',
      desc: 'Il personaggio pu\u00f2 rilevare creature nascoste (che si nascondono/furtano). (32)' },
    { value: 64, label: 'Hold',
      desc: 'Il personaggio \u00e8 trattenuto/paralizzato e non pu\u00f2 muoversi o agire. Normalmente impostato solo da abilit\u00e0 di combattimento, usare con cautela. (64)' },
    { value: 128, label: 'Sanctuary',
      desc: 'Il personaggio \u00e8 protetto dal santuario. Tutti i danni vengono dimezzati. (128)' },
    { value: 256, label: 'Faerie Fire',
      desc: 'Il personaggio \u00e8 delineato dalla faerie fire e non pu\u00f2 nascondersi. Rende anche vulnerabile a danni aggiuntivi. (256)' },
    { value: 512, label: 'Infrared',
      desc: 'Il personaggio ha l\'infravisione e pu\u00f2 vedere al buio. (512)' },
    { value: 1024, label: 'Curse',
      desc: 'Il personaggio \u00e8 maledetto. Impedisce il richiamo e riduce le statistiche. (1024)' },
    { value: 8192, label: 'Protect',
      desc: 'Il personaggio \u00e8 protetto dal male. Gli attaccanti malvagi infliggono meno danni. (8192)' },
    { value: 32768, label: 'Sneak',
      desc: 'Il personaggio si muove silenziosamente ed \u00e8 pi\u00f0 difficile da rilevare. I personaggi che si furtano non generano messaggi di movimento. (32768)' },
    { value: 65536, label: 'Hide',
      desc: 'Il personaggio \u00e8 nascosto e non pu\u00f2 essere visto senza detect hidden. Attaccare o muoversi rivela i personaggi nascosti. (65536)' },
    { value: 131072, label: 'Sleep',
      desc: 'Il personaggio \u00e8 magicamente addormentato e non pu\u00f2 agire. Il risveglio richiede danni o un incantesimo di risveglio. (131072)' },
    { value: 524288, label: 'Flying',
      desc: 'Il personaggio sta volando e pu\u00f2 attraversare acque/baratri. Fornisce anche l\'immunit\u00e0 alle trappole a terra. (524288)' },
    { value: 1048576, label: 'Pass Door',
      desc: 'Il personaggio pu\u00f2 attraversare porte chiuse e muri. (1048576)' },
    { value: 2097152, label: 'Waterwalk',
      desc: '[NON UTILIZZATO] Contrassegnato come non utilizzato nel codice sorgente. (2097152)' },
    { value: 8388608, label: 'Mute',
      desc: 'Il personaggio non pu\u00f2 lanciare incantesimi verbali o parlare. Blocca tutti gli incantesimi che richiedono componenti verbali. (8388608)' },
    { value: 16777216, label: 'Gills',
      desc: 'Il personaggio pu\u00f2 respirare sott\u2019acqua senza affogare. (16777216)' },
    { value: 134217728, label: 'Flaming',
      desc: 'Il personaggio \u00e8 avvolto dalle fiamme. Infligge danni da fuoco agli attaccanti nel combattimento corpo a corpo. (134217728)' }
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
    { label: "Luminoso",
      desc: "L'oggetto emette un bagliore di luce morbida. Illumina la stanza quando portato o in una stanza. (1)" },
    { label: "Rumoroso",
      desc: "L'oggetto emette un suono di ronzio basso. Non pu\u00f2 essere usato efficacemente while nascondendosi o furtando. (2)" },
    null, // ITEM_DARK unused (2)
    null, // ITEM_LOCK unused (3)
    { label: "Malvagio",
      desc: "L'oggetto irradia aure malvagie. I portatori dell'incantesimo Detect Evil vedranno brillare di rosso. Nessun effetto nel gioco. (16)" },
    { label: "Invisibile",
      desc: "L'oggetto \u00e8 invisibile. Richiede Detect Invis per essere visto. (32)" },
    { label: "Magico",
      desc: "L'oggetto \u00e8 magico. Richiede Detect Magic per essere identificato. Pi\u00f0 resistente alla corrosione. (64)" },
    { label: "Non lasciabile",
      desc: "L'oggetto \u00e8 maledetto e non pu\u00f2 essere lasciato. Resta nell'inventario. Gli oggetti maledetti spesso hanno questo flag. (128)" },
    { label: "Benedetto",
      desc: "L'oggetto \u00e8 benedetto. Fornisce un bonus contro il male. Pi\u00f0 resistente alla corrosione. (256)" },
    { label: "Anti Buoni",
      desc: "I personaggi allineati al bene non possono indossare/maneggiare questo oggetto. (512)" },
    { label: "Anti Malvagi",
      desc: "I personaggi allineati al male non possono indossare/maneggiare questo oggetto. (1024)" },
    { label: "Anti Neutrali",
      desc: "I personaggi allineati alla neutralit\u00e0 non possono indossare/maneggiare questo oggetto. (2048)" },
    { label: "Non rimuovibile",
      desc: "L'oggetto \u00e8 maledetto e non pu\u00f2 essere rimosso una volta equipaggiato. (4096)" },
    { label: "Inventario",
      desc: "Oggetto di negozio a quantit\u00e0 infinita, scompare quando il proprietario muore. Non impostare mai manualmente a meno che non si sia sicuri. (8192)" },
    { label: "Avvelenato",
      desc: "L'oggetto \u00e8 rivestito di veleno. Gli attacchi con quest'arma possono avvelenare il bersaglio. Normalmente impostato da abilit\u00e0 che danno anche un timer all'arma. Non impostare mai manualmente a meno che non si sia sicuri. (16384)" },
    { label: "Scaccia Vampiri",
      desc: "Quando impostato su un oggetto HOLD, efficace contro il morso dei vampiri. (32768)" },
    { label: "Sacro",
      desc: "L'oggetto \u00e8 consacrato e sacro. Causa piccoli danni quando raccolto. Quando impostato su un oggetto HOLD, efficace contro il morso dei vampiri. (65536)" },
    { label: "Puo' Lanciare",
      desc: "L'oggetto pu\u00f2 lanciare proiettili (archi, balestre). Deve essere maneggiato per sparare oggetti SHOOTABLE. (131072)" },
    { label: "Puo' essere Lanciato",
      desc: "L'oggetto pu\u00f2 essere sparato da un'arma CAN_SHOOT. I proiettili con questo flag possono essere caricati e sparati. (262144)" },
    { label: "Puo' essere Tirato",
      desc: "L'oggetto pu\u00f2 essere lanciato contro i nemici. Gestito come un attacco a distanza con il comando \"throw\". (524288)" },
    { label: "Torna Indietro",
      desc: "Un oggetto lanciabile che torna al lanciatore. L'oggetto vola indietro dopo essere stato lanciato. (1048576)" },
    { label: "Avvelenato Mortalmente",
      desc: "L'oggetto \u00e8 rivestito di veleno mortale. Gli attacchi con quest'arma possono avvelenare il bersaglio e possono essere letali. Normalmente impostato da abilit\u00e0 che danno anche un timer all'arma. Non impostare mai manualmente a meno che non si sia sicuri. (2097152)" },
    { label: "Raro (Unico)",
      desc: "L'oggetto \u00e8 raro e non pu\u00f2 uscire dal gioco. Deve essere tenuto in un deposito speciale o portato con s\u00e9. (4194304)" },
    { label: "Puo' uscire dal gioco",
      desc: "Consente di far uscire dal gioco gli oggetti che normalmente non possono uscire (es. chiavi). (8388608)" },
    { label: "Nascosto",
      desc: "L'oggetto \u00e8 nascosto nella stanza. Richiede un rilevamento speciale per essere trovato. (16777216)" },
    { label: "Loggato",
      desc: "Flag di registrazione per le azioni di presa/depoca dell'oggetto. Quando impostato, tutte le presi/depoca di questo oggetto vengono registrate. (33554432)" },
    { label: "Immortale",
      desc: "Solo i giocatori immortali possono prendere questo oggetto. I giocatori normali non possono raccoglierlo. (67108864)" },
    { label: "Non localizzabile",
      desc: "L'oggetto non pu\u00f2 essere trovato dall'incantesimo Locate Object. Fornisce nascondiglio magico dalla divinazione. (134217728)" },
];

export const itemWearFlagsName = [
    { label: "Puo' essere raccolto", desc: "L'oggetto pu\u00f2 essere raccolto e portato. (1)" },
    { label: "Alle Dita", desc: "Pu\u00f2 essere indossato a un dito (anelli). (2)" },
    { label: "Al Collo", desc: "Pu\u00f2 essere indossato al collo (amuleti, collane). (4)" },
    { label: "Sul Corpo", desc: "Pu\u00f2 essere indossato sul corpo (armature, abiti). (8)" },
    { label: "Sulla Testa", desc: "Pu\u00f2 essere indossato sulla testa (elmi, corone). (16)" },
    { label: "Sulle Gambe", desc: "Pu\u00f2 essere indossato sulle gambe (pantaloni, gambali). (32)" },
    { label: "Ai Piedi", desc: "Pu\u00f2 essere indossato sui piedi (stivali, sandali). (64)" },
    { label: "Sulle Mani", desc: "Pu\u00f2 essere indossato sulle mani (guanti, guantiacci). (128)" },
    { label: "Sulle Braccia", desc: "Pu\u00f2 essere indossato sulle braccia (bracciali, vambraci). (256)" },
    { label: "Come Scudo", desc: "Pu\u00f2 essere indossato come scudo. (512)" },
    { label: "Attorno al Corpo", desc: "Pu\u00f2 essere indossato attorno al corpo (mantelli, cappucci). (1024)" },
    { label: "Alla Vita", desc: "Pu\u00f2 essere indossato alla vita (cinture, fasce). (2048)" },
    { label: "Sui Polsi", desc: "Pu\u00f2 essere indossato ai polsi (braccialetti, orologi). (4096)" },
    { label: "Come Arma", desc: "Pu\u00f2 essere maneggiato come un'arma. (8192)" },
    { label: "In Mano", desc: "Pu\u00f2 essere tenuto in mano (torce, libri, strumenti). (16384)" },
    { label: "Sugli Occhi", desc: "Pu\u00f2 essere indossato sugli occhi (occhiali, maschere). (32768)" },
    { label: "Sulle Spalle", desc: "Pu\u00f2 essere indossato sulle spalle (spallacci, mantelli). (65536)" },
    { label: "Alle Orecchie", desc: "Pu\u00f2 essere indossato sulle orecchie (orecchini, spine). (131072)" },
    { label: "Sulla Fronte", desc: "Pu\u00f2 essere indossato sulla fronte (bande per capelli, diademi). (262144)" },
    { label: "Appuntato sul Petto", desc: "Pu\u00f2 essere indossato sul petto (spille, medaglioni). (524288)" },
    { label: "Appeso al Fianco", desc: "Pu\u00f2 essere indossato al fianco (foderi, fondine). (1048576)" },
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
    { label: "Buia",
      desc: "La stanza \u00e8 buia. I personaggi senza infravisione non possono vedere. \u00c8 necessaria una fonte di luce per vedere nelle stanze buie. (1)" },
    null, // bit 1 unused
    { label: "Vietata ai Mob",
      desc: "I mob (eccetto domestici incantati e guardie) non possono entrare in questa stanza. Usato per proteggere NPC di missione o zone sicure dall'intrusione dei mob. (4)" },
    { label: "Interno",
      desc: "La stanza \u00e8 al chiuso. Gli effetti meteorologici non si applicano. (8)" },
    { label: "Sotterranea",
      desc: "La stanza \u00e8 sotterranea. Simile all'interno ma per grotte/dungeon. Previene gli effetti meteorologici e richiede fonti di luce. Previene i danni periodici ai vampiri. (16)" },
    null, // bit 5 (ROOM_LOG) not exposed in editor
    { label: "NO Teleport",
      desc: "Gli incantesimi e le abilit\u00e0 di teletrasporto non possono puntare o arrivare in questa stanza. Previene il bypass magico delle difese della stanza. (64)" },
    { label: "Nebbiosa",
      desc: "La stanza \u00e8 piena di nebbia. Riduce la precisione in combattimento e la visibilit\u00e0. Gli attacchi hanno la possibilit\u00e0 di mancare a causa della visibilit\u00e0 oscurata. (128)" },
    { label: "NO Summon",
      desc: "Gli incantesimi di invocazione non possono portare creature in questa stanza. Impedisce ai giocatori di evocare aiuti in aree protette. (256)" },
    { label: "Privata",
      desc: "Solo 2 personaggi possono essere in questa stanza alla volta. Usato per stanze di incontro private o aree di incontro speciali. (512)" },
    { label: "Sicura",
      desc: "Non \u00e8 consentito alcun combattimento in questa stanza. PvP e segnalazioni sono disabilitati. Le stanze sicure sono tipicamente templi o aree di apprendimento. (1024)" },
    { label: "Solitaria",
      desc: "Solo 1 personaggio pu\u00f2 essere in questa stanza alla volta. Usato per aree di missione solitarie o camere personali. (2048)" },
    { label: "Negozio di Animali",
      desc: "La stanza funge da negozio di animali. I giocatori possono acquistare animali qui. La stanza dietro (sud) dovrebbe contenere gli animali disponibili. (4096)" },
    { label: "NO Ritorno",
      desc: "L'incantesimo Word of Recall non funziona in questa stanza. I personaggi non possono teletrasportarsi al loro tempio da qui. (8192)" },
    { label: "Cone Of Silence",
      desc: "Un silenzio magico permea la stanza. Nessun incantesimo verbale pu\u00f2 essere lanciato. Impedisce anche il discorso tra i personaggi. (16384)" },
    { label: "Deposito",
      desc: "Gli oggetti a terra in questa stanza vengono salvati su disco. Gli oggetti lasciati qui persistono tra i riavvii (come le stanze di donazione). (32768)" },
    { label: "Trappola Mortale",
      desc: "I personaggi che entrano in questa stanza subiscono danni letali. Qualsiasi cosa entri (inclusi gli oggetti) viene distrutta. (65536)" },
    { label: "NO Combattimento",
      desc: "Non \u00e8 consentito alcun tipo di combattimento. Anche gli incantesimi vengono bloccati. Le guardie guarderanno i criminali ma non potranno attaccare. (131072)" },
    { label: "Deposito contenitori",
      desc: "Come Deposito ma salva solo oggetti non prendibili. Gli oggetti con il flag ITEM_TAKE non vengono salvati (per prevenire confusione). (262144)" },
    { label: "Teatro",
      desc: "La stanza \u00e8 un teatro, inviando tutti i messaggi ad altre stanze configurate in un oggetto fotocamera (obbligatorio) presente in questa stanza. (524288)" },
    { label: "Spalti",
      desc: "La stanza ha sedili da stadio/teatro. I personaggi seduti qui possono guardare gli eventi svolgersi. Previene parte dello spam e ferma i cambiamenti di cibo/sete. (1048576)" },
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
    { value: EX_ISDOOR,     label: "E' una porta",
      desc: "L'uscita \u00e8 una porta. Necessario per qualsiasi comportamento legato alle porte. Senza questo flag, l'uscita \u00e8 solo un passaggio aperto. (1)" },
    { value: EX_CLOSED,     label: "Chiusa",
      desc: "La porta \u00e8 chiusa. I personaggi non possono passare. Pu\u00f2 essere aperta con il comando \"open\" o con la forza. (2)" },
    { value: EX_LOCKED,     label: "Bloccata",
      desc: "La porta \u00e8 bloccata. Richiede una chiave o grimaldello per essere aperta. I personaggi non possono aprirla senza la chiave corretta o l'abilit\u00e0. (4)" },
    { value: EX_BASHED,     label: "Sfondata",
      desc: "La stata stata sfondata con la forza. Resta aperta fino a quando non riparata da un NPC riparatore. (8)" },
    { value: EX_BASHPROOF,  label: "Non sfondabile",
      desc: "La porta non pu\u00f2 essere sfondata. Resiste a tutti i tentativi di forza bruta. Solo il scassinamento o le chiavi possono aprire questa porta. (16)" },
    { value: EX_PICKPROOF,  label: "Non forzabile",
      desc: "La porta non pu\u00f2 essere forzata con i grimaldelli. Solo la chiave corretta pu\u00f2 aprire questa porta. (32)" },
    { value: EX_PASSPROOF,  label: "Non attraversabile",
      desc: "La porta non pu\u00f2 essere attraversata magicamente. L'incantesimo Pass Door e simili effetti non funzionano su questa porta. (64)" },
    { value: EX_HIDDEN,     label: "Nascosta",
      desc: "L'uscita \u00e8 nascosta e non \u00e8 visibile nelle descrizioni della stanza. I personaggi devono trovarla attraverso la ricerca o mezzi speciali. (128)" },
    { value: EX_NOUN_MALE,  label: "Nome maschile",
      desc: "La porta usa le forme dei sostantivi maschili italiani. Influenzà l'uso degli articoli in italiano (il/la, un/una). (256)" },
    { value: EX_WINDOW,     label: "E' una finestra",
      desc: "L'uscita \u00e8 una finestra, non una porta. Non pu\u00f2 essere sfondata o bloccata come una porta normale. Ha una meccanica speciale di guardare attraverso. (512)" },
    { value: EX_HEAVY,      label: "Resistente",
      desc: "[NON UTILIZZATO] La porta \u00e8 pi\u00f0 pesante e difficile da sfondare. Contrassegnato come non ancora implementato nel sorgente. (1024)" },
    { value: EX_COMPLEX,    label: "Serr. Complessa",
      desc: "[NON UTILIZZATO] La porta ha un meccanismo di serratura complesso. Contrassegnato come non ancora implementato nel sorgente. (2048)" },
];

export const wearName = [
    { number: WEAR_NONE,       name: "in INVENTARIO" },
    { number: WEAR_LIGHT,      name: "come Luce" },
    { number: WEAR_FINGER_L,   name: "al Dito Sinistro" },
    { number: WEAR_FINGER_R,   name: "al Dito Destro" },
    { number: WEAR_NECK_1,     name: "al Collo (2)" },
    { number: WEAR_NECK_2,     name: "al Collo (4)" },
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
    { value: '', label: '-- None --', desc: '' },
    { value: 'spec_breath_any', label: 'spec_breath_any', desc: 'Attacco di alito di drago. Seleziona casualmente un tipo di alito durante il combattimento.' },
    { value: 'spec_breath_acid', label: 'spec_breath_acid', desc: 'Il drago sputa acido. Infligge danni da acido al bersaglio.' },
    { value: 'spec_breath_fire', label: 'spec_breath_fire', desc: 'Il drago sputa fuoco. Infligge danni da fuoco al bersaglio.' },
    { value: 'spec_breath_frost', label: 'spec_breath_frost', desc: 'Il drago sputa ghiaccio. Infligge danni da freddo al bersaglio.' },
    { value: 'spec_breath_gas', label: 'spec_breath_gas', desc: 'Il drago sputa gas velenoso. Danni ad area.' },
    { value: 'spec_breath_lightning', label: 'spec_breath_lightning', desc: 'Il drago sputa fulmini. Infligge danni elettrici.' },
    { value: 'spec_cast_adept', label: 'spec_cast_adept', desc: 'Lancia incantesimi utili sui giocatori di basso livello (armatura, benedizione, cura leggera, ecc). Punta solo i giocatori sotto il livello 5.' },
    { value: 'spec_cast_cleric', label: 'spec_cast_cleric', desc: 'Lancia incantesimi da clerico. Si cura quando ferito, si buffa quando inattivo, attacca con incantesimi offensivi.' },
    { value: 'spec_cast_ghost', label: 'spec_cast_ghost', desc: 'Lancia incantesimi da non morto ma viene distrutto dalla luce del sole.' },
    { value: 'spec_cast_judge', label: 'spec_cast_judge', desc: 'Lancia high explosive sul bersaglio durante il combattimento.' },
    { value: 'spec_cast_mage', label: 'spec_cast_mage', desc: 'Lancia incantesimi da mago. Si buffa e attacca con magia offensiva.' },
    { value: 'spec_cast_psionicist', label: 'spec_cast_psionicist', desc: 'Usa poteri psionici per cura, buff e attacchi.' },
    { value: 'spec_cast_undead', label: 'spec_cast_undead', desc: 'Lancia incantesimi a tema non morto: maledizione, indebolimento, tocco gelido, cecit\u00e0, ecc.' },
    { value: 'spec_cast_anidead', label: 'spec_cast_anidead', desc: 'Lancia incantesimi anti-morto: causa leggera/seria/critica, maledizione, indebolimento, ecc.' },
    { value: 'spec_executioner', label: 'spec_executioner', desc: 'Attacca i criminali (PLR_KILLER, PLR_THIEF) a vista. Urla allarme e chiama le guardie.' },
    { value: 'spec_fido', label: 'spec_fido', desc: 'Divora i cadaveri degli NPC a terra, spargendo gli oggetti sul pavimento.' },
    { value: 'spec_guard', label: 'spec_guard', desc: 'Guardia cittadina. Attacca i criminali, difende dal male, avverte sulle armi in aree legali.' },
    { value: 'spec_janitor', label: 'spec_janitor', desc: 'Pulisce la spazzatura da terra. Raccoglie contenitori per bevande, trash e oggetti economici.' },
    { value: 'spec_mayor', label: 'spec_mayor', desc: 'Segue una routine quotidiana, aprendo/chiudendo le porte della citt\u00e0. Lancia incantesimi da clerico durante il combattimento. Riservato.' },
    { value: 'spec_poison', label: 'spec_poison', desc: 'Avvelena il bersaglio con un attacco di morso durante il combattimento.' },
    { value: 'spec_repairman', label: 'spec_repairman', desc: 'Ripara le porte sfondate. Controlla direzioni casuali per uscite sfondate e le ripristina.' },
    { value: 'spec_thief', label: 'spec_thief', desc: 'Ruba oro dai giocatori e usa l\'abilit\u00e0 trappola nel combattimento.' },
    { value: 'spec_cast_beholder', label: 'spec_cast_beholder', desc: 'Lancia incantesimi specifici del beholder: incantesimo, sonno, telecinesi, carne a pietra, dissoluzione, ecc.' },
    { value: 'spec_cast_medusa', label: 'spec_cast_medusa', desc: 'Lancia incantesimi a tema medusa: presa scioccante, tocco gelido, esplosione di acido, paura, carne a pietra.' },
    { value: 'spec_hunter', label: 'spec_hunter', desc: 'Bracca i criminali ricercati usando una lista di ricercati. Insegue i bersagli attraverso le stanze. Riservato.' },
    { value: 'spec_gate_repair', label: 'spec_gate_repair', desc: 'Segue un percorso per riparare le porte della citt\u00e0. Simile a spec_mayor ma focalizzato sulle porte. Riservato.' },
    { value: 'spec_assassin', label: 'spec_assassin', desc: 'Assassina i bersagli con un colpo alla schiena dalla nascondiglio. Pu\u00f2 uccidere istantaneamente se la differenza di livello \u00e8 grande.' },
    { value: 'spec_bowman', label: 'spec_bowman', desc: 'Usa attacchi a distanza con armi arco/balestra. Guarda direzioni casuali per bersagli.' },
];

export const objSpecFuncs = [
    { value: '', label: '-- None --', desc: '' },
    { value: 'obj_spec_guillotine', label: 'obj_spec_guillotine', desc: 'Un oggetto arredamento che decapita le vittime quando attivato. Riservato, non usare.' },
    { value: 'obj_spec_cauldron', label: 'obj_spec_cauldron', desc: 'Un contenitore che cuoce i cadaveri degli NPC in stufato. Riservato, non usare.' },
    { value: 'obj_spec_event_heroes', label: 'obj_spec_event_heroes', desc: 'Attiva una sequenza di eventi eroici predefinita. Riservato, non usare.' },
];

export const dirName = ["a NORD", "a EST", "a SUD", "a OVEST", "in ALTO", "in BASSO"];

export const dirSimpleName = ["Nord", "Est", "Sud", "Ovest", "Alto", "Basso"];

export const dirSimpleNameEn = ["north", "east", "south", "west", "up", "down"];

export const planeName = [
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
        areaFlags: AREA_NEW_FORMAT,
        areaMusic: "",
        planeName: "Materiale",
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
