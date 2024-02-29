const { Sequelize, DataTypes, Model } = require('sequelize');
const sequelize = new Sequelize('sqlite::memory:');

class Usuario extends Model {
    // aqui podemos poner metodos y propiedades de la clase
    getFullName() {
        return this.nombreUsuario;
    }
}

Usuario.init({
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    nombreUsuario: {
        type: DataTypes.STRING,
        allowNull: false
    },
    contrasegna: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    img: {
        type: DataTypes.STRING,
        allowNull: true
    },
    esAdmin: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
}, {
    sequelize,
    modelName: 'Usuario',
    tableName: 'Usuarios',
    validate: {
        
    }
});
