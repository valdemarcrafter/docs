import { Message } from 'eris';

import { IMClient } from '../../../../client';
import { Command, Context } from '../../../../framework/commands/Command';
import { sequelize } from '../../../../sequelize';
import { CommandGroup, InvitesCommand } from '../../../../types';

export default class extends Command {
	public constructor(client: IMClient) {
		super(client, {
			name: InvitesCommand.subtractLeaves,
			aliases: ['subtract-leaves', 'subleaves', 'sl'],
			group: CommandGroup.Invites,
			guildOnly: true,
			defaultAdminOnly: true
		});
	}

	public async action(message: Message, args: any[], flags: {}, { guild, t, settings }: Context): Promise<any> {
		await sequelize.query(
			`UPDATE joins j LEFT JOIN leaves l ON l.joinId = j.id SET invalidatedReason = ` +
				`CASE WHEN l.id IS NULL OR TIMESTAMPDIFF(SECOND, j.createdAt, l.createdAt) > :time THEN NULL ELSE 'leave' END ` +
				`WHERE j.guildId = :guildId AND (j.invalidatedReason IS NULL OR j.invalidatedReason = 'leave')`,
			{
				replacements: {
					guildId: guild.id,
					time: Number(settings.autoSubtractLeaveThreshold)
				}
			}
		);

		this.client.cache.invites.flush(guild.id);

		return this.sendReply(message, t('cmd.subtractLeaves.done'));
	}
}
