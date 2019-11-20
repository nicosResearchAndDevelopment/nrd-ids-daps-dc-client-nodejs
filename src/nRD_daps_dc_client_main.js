const
    path_ = "app.IDS.daps_dc_client_main"
;

function main({}) {
    return new Promise((resolve, reject) => {
        let result = true;
        try {
            require(`${__dirname}/nRD_daps_dc_client.js`)({
                'config': require(`${__dirname}/config/nRD_daps_dc_client_config.js`),
            }).then(resolve).catch(reject);
            //resolve(result);
        } catch (jex) {
            reject(jex);
        } // try
    }); // rrr
} // main()

main({}).then((result) => {
    console.log(`${new Date().toISOString()} : ${path_} : result : <${JSON.stringify(result, "", "\t")}>`);
}).catch((err) => {
    console.warn(`${new Date().toISOString()} :  : ${path_} : error : <${JSON.stringify(err, "", "\t")}>`);
});