import { Invite, Message } from 'eris';
import moment from 'moment';

import { IMClient } from '../../../../client';
import { Command, Context } from '../../../../framework/commands/Command';
import { channels, InviteCodeAttributes, inviteCodes, members } from '../../../../sequelize';
import { CommandGroup, GuildPermission, InvitesCommand } from '../../../../types';

export default class extends Command {
	public constructor(client: IMClient) {
		super(client, {
			name: InvitesCommand.inviteCodes,
			aliases: [
				'inviteCode',
				'invite-code',
				'invite-codes',
				'getInviteCode',
				'get-invite-code',
				'get-invite-codes',
				'showInviteCode',
				'show-invite-code'
			],
			group: CommandGroup.Invites,
			botPermissions: [GuildPermission.MANAGE_GUILD],
			guildOnly: true,
			defaultAdminOnly: false
		});
	}

	public async action(message: Message, args: any[], flags: {}, { guild, t, settings }: Context): Promise<any> {
		const lang = settings.lang;

		let codes: InviteCodeAttributes[] = await inviteCodes.findAll({
			where: {
				guildId: guild.id
			},
			include: [
				{
					attributes: [],
					model: members,
					as: 'inviter',
					where: {
						id: message.author.id
					},
					required: true
				}
			],
			raw: true
		});

		const activeCodes = (await guild.getInvites().catch(() => [] as Invite[]))
			.filter(code => code.inviter && code.inviter.id === message.author.id)
			.map(code => code);

		const newCodes = activeCodes.filter(code => !codes.find(c => c.code === code.code));

		if (newCodes.length > 0) {
			const newDbCodes: InviteCodeAttributes[] = newCodes.map(code => ({
				code: code.code,
				channelId: code.channel ? code.channel.id : null,
				maxAge: code.maxAge,
				maxUses: code.maxUses,
				uses: code.uses,
				temporary: code.temporary,
				guildId: code.guild.id,
				inviterId: code.inviter ? code.inviter.id : null,
				clearedAmount: 0,
				isVanity: false,
				isWidget: !code.inviter
			}));

			const vanityInv = await guild.getVanity().catch(() => undefined);
			if (vanityInv && vanityInv.code) {
				newDbCodes.push({
					code: vanityInv.code,
					channelId: null,
					guildId: guild.id,
					inviterId: null,
					uses: 0,
					maxUses: 0,
					maxAge: 0,
					temporary: false,
					clearedAmount: 0,
					isVanity: true,
					isWidget: false
				});
			}

			// Insert any new codes that haven't been used yet
			await channels.bulkCreate(
				newCodes.map(c => ({
					id: c.channel.id,
					guildId: c.guild.id,
					name: c.channel.name
				})),
				{
					updateOnDuplicate: ['name']
				}
			);
			await inviteCodes.bulkCreate(newDbCodes);

			codes = codes.concat(newDbCodes);
		}

		const validCodes = codes.filter(
			c =>
				c.maxAge === 0 ||
				moment(c.createdAt)
					.add(c.maxAge, 'second')
					.isAfter(moment())
		);
		const temporaryInvites = validCodes.filter(i => i.maxAge > 0);
		const permanentInvites = validCodes.filter(i => i.maxAge === 0);
		const recommendedCode = permanentInvites.reduce(
			(max, val) => (val.uses > max.uses ? val : max),
			permanentInvites[0]
		);

		const embed = this.createEmbed({
			title: t('cmd.inviteCodes.title', { guild: guild.name })
		});

		if (permanentInvites.length === 0 && temporaryInvites.length === 0) {
			embed.description = t('cmd.inviteCodes.noCodes');
		} else {
			if (recommendedCode) {
				embed.fields.push({
					name: t('cmd.inviteCodes.recommendedCode.title'),
					value: `https://discord.gg/${recommendedCode.code}`
				});
			} else {
				embed.fields.push({
					name: t('cmd.inviteCodes.recommendedCode.title'),
					value: t('cmd.inviteCodes.recommendedCode.none')
				});
			}
		}
		if (permanentInvites.length > 0) {
			// embed.addBlankField();
			embed.fields.push({
				name: t('cmd.inviteCodes.permanent.title'),
				value: t('cmd.inviteCodes.permanent.text')
			});
			permanentInvites.forEach(i => {
				embed.fields.push({
					name: `${i.code}`,
					value: t('cmd.inviteCodes.permanent.entry', {
						uses: i.uses,
						maxAge: i.maxAge,
						maxUses: i.maxUses,
						channel: `<#${i.channelId}>`
					}),
					inline: true
				});
			});
		}
		if (temporaryInvites.length > 0) {
			// embed.addBlankField();
			embed.fields.push({
				name: t('cmd.inviteCodes.temporary.title'),
				value: t('cmd.inviteCodes.temporary.text')
			});
			temporaryInvites.forEach(i => {
				const maxAge = moment
					.duration(i.maxAge, 's')
					.locale(lang)
					.humanize();
				const expires = moment(i.createdAt)
					.add(i.maxAge, 's')
					.locale(lang)
					.fromNow();
				embed.fields.push({
					name: `${i.code}`,
					value: t('cmd.inviteCodes.temporary.entry', {
						uses: i.uses,
						maxAge,
						maxUses: i.maxUses,
						channel: `<#${i.channelId}>`,
						expires
					}),
					inline: true
				});
			});
		}

		await this.sendEmbed(await message.author.getDMChannel(), embed);
		await this.sendReply(message, `<@!${message.author.id}>, ${t('cmd.inviteCodes.dmSent')}`);
	}
}
