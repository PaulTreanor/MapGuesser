const fs = require('fs');
const path = require('path');

const locationsData = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../data/initial-locations.json'), 'utf8')
);

// Generate SQL
let sql = 'DELETE FROM locations;\n\n';
sql += 'INSERT INTO locations (location, latitude, longitude) VALUES\n';

const values = locationsData.map(loc => 
  `('${loc.location.replace(/'/g, "''")}', ${loc.coordinates[1]}, ${loc.coordinates[0]})`
);

sql += values.join(',\n') + ';';

fs.writeFileSync(path.join(__dirname, 'seed.sql'), sql);
console.log('Generated seed.sql file');