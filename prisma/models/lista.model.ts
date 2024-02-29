const { Model, DataTypes } = require('sequelize');

class Lista extends Model {
    // aqui podemos poner metodos y propiedades de la clase
    
}

Lista.init({
    nombre: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    esPrivada: {
        type: DataTypes.BOOLEAN,
        allowNull: false
    },
    fechaUltimaMod: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    img: {
        type: DataTypes.STRING,
        allowNull: true
    },
    esAlbum: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
    },
    tipo: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    descripcion: {
        type: DataTypes.STRING,
        allowNull: true
    },
}, {
    sequelize,
    modelName: 'Lista',
    tableName: 'Listas',
});

export default Lista;