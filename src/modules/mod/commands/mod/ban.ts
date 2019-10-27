import { Message } from 'eris';

import { IMClient } from '../../../../client';
import { Command, Context } from '../../../../framework/commands/Command';
import { NumberResolver, StringResolver, UserResolver } from '../../../../framework/resolvers';
import { members, punishments, PunishmentType } from '../../../../sequelize';
import { BasicUser, CommandGroup, GuildPermission, ModerationCommand } from '../../../../types';

export default class extends Command {
	public constructor(client: IMClient) {
		super(client, {
			name: ModerationCommand.ban,
			aliases: [],
			args: [
				{
					name: 'user',
					resolver: UserResolver,
					required: true
				},
				{
					name: 'reason',
					resolver: StringResolver,
					rest: true
				}
			],
			flags: [
				{
					name: 'deleteMessageDays',
					resolver: NumberResolver,
					short: 'd'
				}
			],
			group: CommandGroup.Moderation,
			botPermissions: [GuildPermission.BAN_MEMBERS],
			defaultAdminOnly: true,
			guildOnly: true
		});
	}

	public async action(
		message: Message,
		[targetUser, reason]: [BasicUser, string],
		{ deleteMessageDays }: { deleteMessageDays: number },
		{ guild, me, settings, t }: Context
	): Promise<any> {
		let targetMember = guild.members.get(targetUser.id);
		if (!targetMember) {
			targetMember = await guild.getRESTMember(targetUser.id).catch(() => undefined);
		}

		const embed = this.client.mod.createBasicEmbed(targetUser);

		if (!targetMember || this.client.mod.isPunishable(guild, targetMember, message.member, me)) {
			if (targetMember) {
				await this.client.mod.informAboutPunishment(targetMember, PunishmentType.ban, settings, { reason });
			}

			const days = deleteMessageDays ? deleteMessageDays : 0;
			try {
				await this.client.banGuildMember(guild.id, targetUser.id, days, reason);

				// Make sure member exists in DB
				await members.insertOrUpdate({
					id: targetUser.id,
					name: targetUser.username,
					discriminator: targetUser.discriminator
				});

				const punishment = await punishments.create({
					id: null,
					guildId: guild.id,
					memberId: targetUser.id,
					type: PunishmentType.ban,
					amount: 0,
					args: '',
					reason: reason,
					creatorId: message.author.id
				});

				await this.client.mod.logPunishmentModAction(
					guild,
					targetUser,
					punishment.type,
					punishment.amount,
					[{ name: 'Reason', value: reason }],
					message.author
				);

				embed.description = t('cmd.ban.done');
			} catch (error) {
				embed.description = t('cmd.ban.error', { error });
			}
		} else {
			embed.description = t('cmd.ban.canNotBan');
		}

		const response = await this.sendReply(message, embed);
		if (response && settings.modPunishmentBanDeleteMessage) {
			const func = () => {
				message.delete().catch(() => undefined);
				response.delete().catch(() => undefined);
			};
			setTimeout(func, 4000);
		}
	}
}
