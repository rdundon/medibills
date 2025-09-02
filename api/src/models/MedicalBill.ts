import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import { MedicalBillAttributes } from '../types';

interface MedicalBillCreationAttributes extends Optional<MedicalBillAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class MedicalBill extends Model<MedicalBillAttributes, MedicalBillCreationAttributes> implements MedicalBillAttributes {
  public id!: string;
  public userId!: string;
  public medicalProviderId!: string;
  public dateOfService!: Date;
  public total!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

MedicalBill.init({
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
  dateOfService: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    validate: {
      isDate: true,
      notEmpty: true,
    },
  },
  total: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0,
      isDecimal: true,
    },
    get() {
      const value = this.getDataValue('total');
      return value ? parseFloat(value.toString()) : 0;
    },
  },
}, {
  sequelize,
  modelName: 'MedicalBill',
  tableName: 'medical_bills',
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
  ],
});

export { MedicalBill };