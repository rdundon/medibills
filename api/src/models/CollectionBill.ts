import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import { CollectionBillAttributes } from '../types';

interface CollectionBillCreationAttributes extends Optional<CollectionBillAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class CollectionBill extends Model<CollectionBillAttributes, CollectionBillCreationAttributes> implements CollectionBillAttributes {
  public id!: string;
  public userId!: string;
  public medicalProviderId!: string;
  public dateOfNotice!: Date;
  public dateOfService!: Date;
  public amountTotal!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

CollectionBill.init({
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
  dateOfNotice: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    validate: {
      isDate: true,
      notEmpty: true,
    },
  },
  dateOfService: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    validate: {
      isDate: true,
      notEmpty: true,
    },
  },
  amountTotal: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0,
      isDecimal: true,
    },
  },
}, {
  sequelize,
  modelName: 'CollectionBill',
  tableName: 'collection_bills',
  timestamps: true,
  indexes: [
    {
      fields: ['userId'],
    },
    {
      fields: ['userId', 'dateOfNotice'],
    },
    {
      fields: ['medicalProviderId'],
    },
  ],
});

export { CollectionBill };