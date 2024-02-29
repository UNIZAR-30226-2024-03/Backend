const { DataTypes } = require('sequelize');

import Audio from "./audio.model";
import Usuario from "./usuario.model";
import Lista from "./lista.model";

const esPropietario = sequelize.define('esPropietario', {
    idUsuario: {
        type: DataTypes.INTEGER,
        primaryKey: true,
    },
    idLista: {
        type: DataTypes.INTEGER,
        primaryKey: true,
    },
}, {
    tableName: 'esPropietario',
    timestamps: false
});
esPropietario.belongsTo(Usuario, { foreignKey: 'idUsuario' });
esPropietario.belongsTo(Lista, { foreignKey: 'idLista' });


const sigueLista = sequelize.define('sigueLista', {
    idUsuario: {
        type: DataTypes.INTEGER,
        primaryKey: true,
    },
    idLista: {
        type: DataTypes.INTEGER,
        primaryKey: true,
    },
    ultimaEscucha: {
        type: DataTypes.DATE,
        allowNull: false
    },
}, {
    tableName: 'esSeguidor',
    timestamps: false
});
sigueLista.belongsTo(Usuario, { foreignKey: 'idUsuario' });
sigueLista.belongsTo(Lista, { foreignKey: 'idLista' });

const contiene = sequelize.define('contiene', {
    idLista: {
        type: DataTypes.INTEGER,
        primaryKey: true,
    },
    idAudio: {
        type: DataTypes.INTEGER,
        primaryKey: true,
    },
}, {
    tableName: 'contiene',
    timestamps: false
});
contiene.belongsTo(Lista, { foreignKey: 'idLista' });
contiene.hasMany(Audio, { foreignKey: 'idAudio' });