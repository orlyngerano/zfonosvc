/**
 * db model definitions
 */
module.exports = function (seqObj) {

    const Sequelize = seqObj.Sequelize;
    const sequelize = seqObj.seqPG;

    const Device = sequelize.define('Device', {
        DeviceID: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            unique: true,
        },
        DeviceName: Sequelize.TEXT,
        BatteryStatus: Sequelize.TEXT,
        Longitude: Sequelize.TEXT,
        Latitude: Sequelize.TEXT
    }, {
            freezeTableName: true
        });

    return {
        Device: Device
    }
}