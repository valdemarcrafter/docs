import { settings, SettingsKey } from '../../sequelize';
import { defaultSettings, settingsInfo, SettingsObject, toDbValue } from '../../settings';

import { Cache } from './Cache';

export class SettingsCache extends Cache<SettingsObject> {
	public async init() {
		// TODO
	}

	protected async _get(guildId: string): Promise<SettingsObject> {
		const set = await settings.findOne({ where: { guildId } });
		return { ...defaultSettings, ...(set ? set.value : null) };
	}

	public async setOne<K extends SettingsKey>(
		guildId: string,
		key: K,
		value: SettingsObject[K]
	): Promise<SettingsObject[K]> {
		const set = await this.get(guildId);
		const dbVal = toDbValue(settingsInfo[key], value);

		// Check if the value changed
		if (set[key] !== dbVal) {
			set[key] = dbVal;

			// Save into DB
			settings.bulkCreate(
				[
					{
						id: null,
						guildId,
						value: set
					}
				],
				{
					updateOnDuplicate: ['value', 'updatedAt']
				}
			);
		}

		return dbVal;
	}
}
