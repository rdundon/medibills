import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import { MedicalProviderAttributes } from '../types';

interface MedicalProviderCreationAttributes extends Optional<MedicalProviderAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class MedicalProvider extends Model<MedicalProviderAttributes, MedicalProviderCreationAttributes> implements MedicalProviderAttributes {
  public id!: string;
  public userId!: string;
  public name!: string;
  public address!: string;
  public phone!: string;
  public website!: string;
  public paymentWebsite!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

MedicalProvider.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 255],
    },
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true,
    validate: {
      len: [0, 20],
    },
  },
  website: {
    type: DataTypes.STRING(255),
    allowNull: true,
    validate: {
      isUrl: true,
    },
  },
  paymentWebsite: {
    type: DataTypes.STRING(255),
    allowNull: true,
    validate: {
      isUrl: true,
    },
  },
}, {
  sequelize,
  modelName: 'MedicalProvider',
  tableName: 'medical_providers',
  timestamps: true,
  indexes: [
    {
      fields: ['userId'],
    },
    {
      fields: ['userId', 'name'],
    },
  ],
});

export { MedicalProvider };