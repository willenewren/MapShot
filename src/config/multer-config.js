const multer = require('multer');
const fs = require('fs');
// SET STORAGE
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    const path = 'public/pin_photos/' + req.user.user_id + '/';
    fs.mkdirSync(path, {recursive: true});
    cb(null, path);
  },
  filename: function(req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now());
  },
});

const upload = multer({storage: storage, limits: {
  fileSize: 1024 * 1024 * 30,
}});

module.exports = upload;
