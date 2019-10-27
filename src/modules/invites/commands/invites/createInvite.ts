import { Message, TextChannel } from 'eris';

import { IMClient } from '../../../../client';
import { Command, Context } from '../../../../framework/commands/Command';
import { ChannelResolver, StringResolver } from '../../../../framework/resolvers';
import { channels, inviteCodes, InviteCodeSettingsKey } from '../../../../sequelize';
import { CommandGroup, GuildPermission, InvitesCommand } from '../../../../types';

export default class extends Command {
	public constructor(client: IMClient) {
		super(client, {
			name: InvitesCommand.createInvite,
			aliases: ['create-invite'],
			args: [
				{
					name: 'name',
					resolver: StringResolver,
					required: true
				},
				{
					name: 'channel',
					resolver: ChannelResolver
				}
			],
			group: CommandGroup.Invites,
			botPermissions: [GuildPermission.CREATE_INSTANT_INVITE],
			guildOnly: true,
			defaultAdminOnly: true,
			extraExamples: ['!createInvite reddit', '!createInvite website #welcome']
		});
	}

	public async action(
		message: Message,
		[name, _channel]: [string, TextChannel],
		flags: {},
		{ guild, t, me }: Context
	): Promise<any> {
		const channel = _channel ? _channel : (message.channel as TextChannel);

		if (!channel.permissionsOf(me.id).has(GuildPermission.CREATE_INSTANT_INVITE)) {
			return this.sendReply(message, t('permissions.createInstantInvite'));
		}

		const inv = await channel.createInvite(
			{
				maxAge: 0,
				maxUses: 0,
				temporary: false,
				unique: true
			},
			name ? name : null
		);

		await channels.insertOrUpdate({
			id: inv.channel.id,
			name: inv.channel.name,
			guildId: guild.id
		});

		await inviteCodes.insertOrUpdate({
			code: inv.code,
			maxAge: 0,
			maxUses: 0,
			temporary: false,
			channelId: inv.channel.id,
			uses: 0,
			guildId: inv.guild.id,
			inviterId: message.author.id,
			clearedAmount: 0,
			isVanity: false,
			isWidget: false
		});

		await this.client.cache.inviteCodes.setOne(guild.id, inv.code, InviteCodeSettingsKey.name, name);

		return this.sendReply(
			message,
			t('cmd.createInvite.done', {
				code: `https://discord.gg/${inv.code}`,
				channel: `<#${channel.id}>`,
				name
			})
		);
	}
}
