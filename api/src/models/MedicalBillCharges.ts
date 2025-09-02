import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import { MedicalBillChargesAttributes } from '../types';

interface MedicalBillChargesCreationAttributes extends Optional<MedicalBillChargesAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class MedicalBillCharges extends Model<MedicalBillChargesAttributes, MedicalBillChargesCreationAttributes> implements MedicalBillChargesAttributes {
  public id!: string;
  public medicalBillId!: string;
  public amount!: number;
  public description!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

MedicalBillCharges.init({
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
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0,
      isDecimal: true,
    },
    get() {
      const value = this.getDataValue('amount');
      return value ? parseFloat(value.toString()) : 0;
    },
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  sequelize,
  modelName: 'MedicalBillCharges',
  tableName: 'medical_bill_charges',
  timestamps: true,
  indexes: [
    {
      fields: ['medicalBillId'],
    },
  ],
});

export { MedicalBillCharges };