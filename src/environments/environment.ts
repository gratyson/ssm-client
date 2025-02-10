// need to explicitly declare type so it gets a property string index
const SECRET_IMAGE_PATH_BY_TYPE: { [ k: string ]: string } = {
    "website_password": "assets/images/website.png",
    "credit_card": "assets/images/credit_card.png",
    "text_blob": "assets/images/abc.png"
};

export const environment = {
    GRAPHQL_ENPOINT_URL: "graphql",

    IMAGE_FILE_ENDPOINT_URL: "rest/image",

    MOBILE_WIDTH_BREAK_PX: 500,
    TABLET_WIDTH_BREAK_PX: 1000,

    CACHE_APP_PREFIX: "ssm-",
    CACHE_EXPIRATION_TIME_IN_MS: 14400000,

    COPY_MESSAGE_DURATION_MS: 3000,

    SECRET_MENU_ICON: "password",
    KEY_MENU_ICON: "key",
    SECRET_MENU_IMAGE_PATH: "assets/images/password.png",
    KEY_MENU_IMAGE_PATH: "assets/images/key.png",

    DEFAULT_KEY_IMAGE_PATH: "assets/images/key.png",
    DEFAULT_SECRET_IMAGE_PATH: "assets/images/lock.png",
    SECRET_IMAGE_PATH_BY_TYPE: SECRET_IMAGE_PATH_BY_TYPE,

}