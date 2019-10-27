import { VoiceConnection, VoiceConnectionManager } from 'eris';

import { MusicItem } from './modules/music/models/MusicItem';

export enum BotType {
	regular = 'regular',
	pro = 'pro',
	custom = 'custom'
}

export interface BasicUser {
	id: string;
	createdAt: number;
	username: string;
	avatarURL: string;
	discriminator: string;
}

export enum GuildPermission {
	ADMINISTRATOR = 'administrator',
	READ_MESSAGES = 'readMessages',
	SEND_MESSAGES = 'sendMessages',
	MANAGE_MESSAGES = 'manageMessages',
	EMBED_LINKS = 'embedLinks',
	MANAGE_GUILD = 'manageGuild',
	VIEW_AUDIT_LOGS = 'viewAuditLogs',
	MANAGE_ROLES = 'manageRoles',
	CREATE_INSTANT_INVITE = 'createInstantInvite',
	BAN_MEMBERS = 'banMembers',
	KICK_MEMBERS = 'kickMembers',
	ADD_REACTIONS = 'addReactions',
	MANAGE_EMOJIS = 'manageEmojis',
	READ_MESSAGE_HISTORY = 'readMessageHistory'
}

export enum PromptResult {
	SUCCESS,
	FAILURE,
	TIMEOUT
}

export enum CommandGroup {
	Invites = 'Invites',
	Ranks = 'Ranks',
	Config = 'Config',
	Info = 'Info',
	Premium = 'Premium',
	Moderation = 'Moderation',
	Report = 'Report',
	Music = 'Music',
	Other = 'Other'
}

export enum ShardCommand {
	CACHE = 'CACHE',
	CUSTOM = 'CUSTOM',
	DIAGNOSE = 'DIAGNOSE',
	FLUSH_CACHE = 'FLUSH_CACHE',
	SUDO = 'SUDO',
	OWNER_DM = 'OWNER_DM',
	USER_DM = 'USER_DM',
	LEAVE_GUILD = 'LEAVE_GUILD',
	STATUS = 'STATUS',
	RELOAD_MUSIC_NODES = 'RELOAD_MUSIC_NODES'
}

export enum ChartType {
	joins = 'joins',
	leaves = 'leaves',
	usage = 'usage'
}

export enum BotCommand {
	config = 'config',
	botConfig = 'botConfig',
	inviteCodeConfig = 'inviteCodeConfig',
	memberConfig = 'memberConfig',
	permissions = 'permissions',
	interactiveConfig = 'interactiveConfig',

	botInfo = 'botInfo',
	credits = 'credits',
	getBot = 'getBot',
	help = 'help',
	members = 'members',
	ping = 'ping',
	prefix = 'prefix',
	setup = 'setup',
	support = 'support',

	export = 'export',
	premium = 'premium',
	tryPremium = 'tryPremium',

	makeMentionable = 'makeMentionable',
	mentionRole = 'mentionRole'

	/*report = 'report',*/
}

export enum InvitesCommand {
	createInvite = 'createInvite',
	addInvites = 'addInvites',
	clearInvites = 'clearInvites',
	fake = 'fake',
	info = 'info',
	inviteCodes = 'inviteCodes',
	inviteDetails = 'inviteDetails',
	invites = 'invites',
	leaderboard = 'leaderboard',
	removeInvites = 'removeInvites',
	restoreInvites = 'restoreInvites',
	subtractFakes = 'subtractFakes',
	subtractLeaves = 'subtractLeaves',

	addRank = 'addRank',
	fixRanks = 'fixRanks',
	ranks = 'ranks',
	removeRank = 'removeRank',

	graph = 'graph'
}

export enum ModerationCommand {
	punishmentConfig = 'punishmentConfig',
	strikeConfig = 'strikeConfig',

	check = 'check',
	caseDelete = 'caseDelete',
	caseView = 'caseView',

	ban = 'ban',
	mute = 'mute',
	kick = 'kick',
	softBan = 'softBan',
	strike = 'strike',
	unban = 'unban',
	unhoist = 'unhoist',
	unmute = 'unmute',
	warn = 'warn',

	clean = 'clean',
	cleanText = 'cleanText',
	cleanShort = 'cleanShort',
	purgeSafe = 'purgeSafe',
	purgeUntil = 'purgeUntil',
	purge = 'purge'
}

export enum MusicCommand {
	play = 'play',
	pause = 'pause',
	resume = 'resume',
	skip = 'skip',
	seek = 'seek',
	queue = 'queue',
	rewind = 'rewind',
	nowPlaying = 'nowPlaying',
	disconnect = 'disconnect',
	search = 'search',
	volume = 'volume',
	repeat = 'repeat',
	mashup = 'mashup',
	lyrics = 'lyrics'
}

export enum ChannelType {
	GUILD_TEXT = 0,
	DM = 1,
	GUILD_VOICE = 2,
	GROUP_DM = 3,
	GUILD_CATEGORY = 4
}

export interface MusicQueue {
	current: MusicItem;
	queue: MusicItem[];
}

export enum MusicPlatformTypes {
	YouTube = 'youtube',
	SoundCloud = 'soundcloud',
	RaveDJ = 'ravedj',
	iHeartRADIO = 'iheartradio',
	TuneIn = 'tuneIn'
}

export interface BasicInvite {
	code: string;
	channel: {
		id: string;
		name: string;
	};
}
export interface BasicMember {
	nick?: string;
	user: {
		id: string;
		username: string;
		discriminator: string;
		avatarURL: string;
	};
}

export interface LavaPlayerManager extends VoiceConnectionManager<LavaPlayer> {}

export interface MusicServiceInterface extends LavaPlayerManager {}

export interface LavaPlayerState {
	position: number;
	time: number;
}

export interface LavaPlayer extends VoiceConnection {
	node: string;
	hostname: string;
	manager: LavaPlayerManager | null;
	track: string | null;
	state: LavaPlayerState;

	play: (track: string) => void;
	stop: () => void;
	pause: () => void;
	resume: () => void;
	seek: (position: number) => void;
	setVolume: (volume: number) => void;

	on(event: 'debug' | 'warn', listener: (message: string) => void): this;
	on(event: 'error' | 'disconnect', listener: (err: Error) => void): this;
	on(event: 'reconnect', listener: () => void): this;
	on(event: 'pong', listener: (latency: number) => void): this;
	on(event: 'speakingStart', listener: (userID: string) => void): this;
	on(event: 'speakingStop', listener: (userID: string) => void): this;
	on(event: 'stateUpdate', listener: (state: LavaPlayerState) => void): this;
	on(event: 'end', listener: (event: LavaEndEvent) => void): this;
}

export interface LavaEndEvent {
	op: string;
	reason: string;
	type: string;
	track: string;
	guildId: string;
}

export interface LavaTrackInfo {
	identifier: string;
	isSeekable: boolean;
	author: string;
	length: number;
	isStream: boolean;
	position: number;
	title: string;
	uri: string;
}

export interface LavaTrack {
	track: string;
	info: LavaTrackInfo;
}

export interface GatewayInfo {
	url: string;
	shards: number;
	session_start_limit: {
		total: number;
		remaining: number;
		reset_after: number;
	};
}
