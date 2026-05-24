import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from 'sequelize';

import db from '../database/sequelize';

class Birthday extends Model<InferAttributes<Birthday>, InferCreationAttributes<Birthday>> {
  declare id: CreationOptional<string>;
  declare user_id: string;
  declare guild_id: string;
  declare username: string;
  declare guild_name: string;
  declare birthdate: Date;
  declare age: number | null;
  declare show_age: boolean;
  declare readonly created_at: CreationOptional<Date>;
  declare readonly updated_at: CreationOptional<Date>;
}

Birthday.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  guild_id: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  guild_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  birthdate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  age: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  show_age: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  created_at: DataTypes.DATE,
  updated_at: DataTypes.DATE,
}, {
  sequelize: db,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [{ unique: true, fields: ['user_id', 'guild_id'] }],
  hooks: {
    beforeCreate: (birthday) => {
      if (!birthday.show_age) {
        birthday.age = null;
      }

      const today = new Date();
      const birthdate = new Date(birthday.birthdate);
      let age = today.getFullYear() - birthdate.getFullYear();
      const monthDiff = today.getMonth() - birthdate.getMonth();

      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthdate.getDate())) {
        age--;
      }

      birthday.age = age;
    },
  },
});

export default Birthday;
