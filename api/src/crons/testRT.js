async function log_every_10_secs() {
    console.log(new Date());
}

exports.handler = log_every_10_secs;

if (require.main === module) {
    log_every_10_secs();
}
