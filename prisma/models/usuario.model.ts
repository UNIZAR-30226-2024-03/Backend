const { Model, DataTypes } = require('sequelize');

class Usuario extends Model {
    // aqui podemos poner metodos y propiedades de la clase
}

Usuario.init({
    idUsuario: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: { isEmail: true }
    },
    nombreUsuario: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
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

export default Usuario;