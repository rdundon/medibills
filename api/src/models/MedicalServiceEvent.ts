import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import { MedicalServiceEventAttributes } from '../types';

interface MedicalServiceEventCreationAttributes extends Optional<MedicalServiceEventAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class MedicalServiceEvent extends Model<MedicalServiceEventAttributes, MedicalServiceEventCreationAttributes> implements MedicalServiceEventAttributes {
  public id!: string;
  public userId!: string;
  public medicalProviderId!: string;
  public explanationOfBenefitsId!: string;
  public dateOfService!: Date;
  public description!: string;
  public amount!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

MedicalServiceEvent.init({
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
  medicalProviderId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'medical_providers',
      key: 'id',
    },
    onDelete: 'RESTRICT',
  },
  explanationOfBenefitsId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'explanation_of_benefits',
      key: 'id',
    },
    onDelete: 'SET NULL',
  },
  dateOfService: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    validate: {
      isDate: true,
      notEmpty: true,
    },
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    validate: {
      min: 0,
      isDecimal: true,
    },
  },
}, {
  sequelize,
  modelName: 'MedicalServiceEvent',
  tableName: 'medical_service_events',
  timestamps: true,
  indexes: [
    {
      fields: ['userId'],
    },
    {
      fields: ['userId', 'dateOfService'],
    },
    {
      fields: ['medicalProviderId'],
    },
    {
      fields: ['explanationOfBenefitsId'],
    },
  ],
});

export { MedicalServiceEvent };