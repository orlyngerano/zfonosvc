/**
 * device endpoint configuration
 */
module.exports = function (app, seqObj) {
    const model = require('../helper/models')(seqObj);
    const sequelize = seqObj.seqPG;
    const Device = model.Device;
    const Op = seqObj.Sequelize.Op

    app.get('/device', async (request, response) => {

        let {start, count, sort, search} = request.query;

        if (start) {
            start = parseInt(start, 10);
            if (isNaN(start)) {
                response.status(400).send('Bad query parameters');
                return;
            }
        }

        if (count) {
            count = parseInt(count, 10);
            if (isNaN(count)) {
                response.status(400).send('Bad query parameters');
                return;
            }
        }


        let total = 0;

        try {


            let totalFilter = {
                attributes: [[sequelize.fn('COUNT', sequelize.col('DeviceID')), 'total']]
            };

            if(search){
                totalFilter['where'] = {
                    [Op.or]: [{
                        DeviceName: {
                            [Op.iLike]: `%${search}%`
                        }
                    }]
                };
            }

            const deviceTotal = await Device.findAll(totalFilter);

            total = deviceTotal[0].getDataValue('total')

            let filter = {};

            if (start && count) {
                filter['limit'] = count;
                filter['offset'] = start - 1;
            } else if (start) {
                filter['offset'] = start - 1;
            } else if (count) {
                filter['limit'] = count;
            }

            if(sort){
                let sortFilter = `${sort}`;
                if(sort.charAt(0)=='-'){
                    sortFilter = `${sort.slice(1)} DESC`;
                }
                filter['order'] = sequelize.literal(sortFilter);
            }

            if(search){
                filter['where'] = {
                    [Op.or]: [{
                        DeviceName: {
                            [Op.iLike]: `%${search}%`
                        }
                    }]
                };
            }

            const devices = await Device.findAll(filter);

            response.json({ devices: devices, total: total });

        } catch (error) {
            console.log(error);
            response.status(500).send(error);
        }
    });

    app.get('/device/:id', async (request, response) => {
        const devices = await Device.findAll({
            where: { DeviceID: request.params.id }
        });

        let device = {};
        if (devices.length > 0) {
            device = devices[0];
        }

        response.json(device);
    });

    app.post('/device', async (request, response) => {
        let { DeviceID, DeviceName, BatteryStatus, Longitude, Latitude } = request.body;

        try {
            const newDevice = await Device.create({
                DeviceID: DeviceID,
                DeviceName: DeviceName,
                BatteryStatus: BatteryStatus, 
                Longitude: Longitude,
                Latitude: Latitude
            });
            response.json(newDevice);
        } catch (error) {
            response.status(500).send(error);
        }
    });

    app.put('/device/:id', async (request, response) => {
        let { DeviceName, BatteryStatus, Longitude, Latitude } = request.body;
        try {
            let newDevice = await Device.update({
                DeviceName: DeviceName,
                BatteryStatus: BatteryStatus, 
                Longitude: Longitude,
                Latitude: Latitude
            },
                {
                    where: {
                        DeviceID: request.params.id
                    },
                    returning: true, 
                    plain: true
                });

            response.json(newDevice[1]);

        } catch (error) {
            response.status(500).send(error);
        }
    });

    app.delete('/device/:id', async (request, response) => {
        try {
            const deleted = await Device.destroy({
                where:{
                    DeviceID: request.params.id
                }
            });
            response.json(deleted);
        } catch (error) {
            response.status(500).send(error);
        }
    });

}