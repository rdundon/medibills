import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import { MedicalBillPaymentsAttributes } from '../types';

interface MedicalBillPaymentsCreationAttributes extends Optional<MedicalBillPaymentsAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class MedicalBillPayments extends Model<MedicalBillPaymentsAttributes, MedicalBillPaymentsCreationAttributes> implements MedicalBillPaymentsAttributes {
  public id!: string;
  public userId!: string;
  public amount!: number;
  public date!: Date;
  public notes?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

MedicalBillPayments.init({
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
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    validate: {
      isDate: true,
      notEmpty: true,
    },
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  sequelize,
  modelName: 'MedicalBillPayments',
  tableName: 'medical_bill_payments',
  timestamps: true,
  indexes: [
    {
      fields: ['userId'],
    },
    {
      fields: ['userId', 'date'],
    },
  ],
});

export { MedicalBillPayments };