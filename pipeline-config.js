module.exports = {
    sftpConfigFile: "../sftp-config.js",
    productionPath: "explorer_federation",
    stagingPath: "explorer_federation_staging",
    htaccessFile: "UPLOAD-THIS.htaccess",
    basePath: "/",
    databaseDir: "",
    uncompressedDir: "img/uploads-uncompressed",
    compressedDir: "uploads",
    faviconPath: "img/logos-originals/Birdhouse-Logo.jpg",
    faviconsOutputDir: "img/favicons",
    faviconsFileName: "Favicon",
    faviconSizes: [

        ],
    manifestIconPath: "img/logos-originals/Birdhouse-Logo.png",
    manifestIconOutputDir: "img/icons",
    manifestIconFileName: "Icon",
    manifestIconSizes: [

        ],
    statisticsFile: "pipeline-log.txt",
    ignoredFileTypes: [
        ".zip",
        ".rar",
        ".md",
        ".txt",
        ".psd",
        ".htaccess"
        ],
    directoriesToInclude: [
        "src",
        "fonts",
        "img/favicons",
        "img/icons",
        "img/screenshots",
        "img/graphics",
        "uploads"
        ],
    directoriesToExcludeFromCache: [
        "img/screenshots",
        "uploads"
        ],
    preReleaseScripts: [

        ],
    postReleaseScripts: [

        ]
    };