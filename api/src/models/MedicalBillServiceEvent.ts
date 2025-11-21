import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import { MedicalBillServiceEventAttributes } from '../types';

interface MedicalBillServiceEventCreationAttributes extends Optional<MedicalBillServiceEventAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class MedicalBillServiceEvent extends Model<MedicalBillServiceEventAttributes, MedicalBillServiceEventCreationAttributes> implements MedicalBillServiceEventAttributes {
  public id!: string;
  public medicalBillId!: string;
  public medicalServiceEventId!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

MedicalBillServiceEvent.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  medicalBillId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'medical_bills',
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  medicalServiceEventId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'medical_service_events',
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
}, {
  sequelize,
  modelName: 'MedicalBillServiceEvent',
  tableName: 'medical_bill_service_events',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['medicalBillId', 'medicalServiceEventId'],
    },
    {
      fields: ['medicalBillId'],
    },
    {
      fields: ['medicalServiceEventId'],
    },
  ],
});

export { MedicalBillServiceEvent };