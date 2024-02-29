const { Model, DataTypes } = require('sequelize');

class Audio extends Model {
    // aqui podemos poner metodos y propiedades de la clase
    getFullName() {
        return this.nombreUsuario;
    }
}

Audio.init({
    titulo: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    path: {
        type: DataTypes.STRING,
        allowNull: false
    },
    fechaLanz: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    img: {
        type: DataTypes.STRING,
        allowNull: true
    },
    esPrivado: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
    },
    duracionSeg: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    esPodcast: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
    },
}, {
    sequelize,
    modelName: 'Audio',
    tableName: 'Audios',
});

export default Audio;