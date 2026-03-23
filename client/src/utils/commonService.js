import SpecificServiceEndPoints from "../services/specificServiceEndPoints";

export async function checkGoogleStatus(setMenuItemCallback = null) {
    try {
        const response = await SpecificServiceEndPoints.getGoogleConnectionStatus();

        if (response.data.connected) {
            if (response.data.username !== '' && setMenuItemCallback != null) {
                setMenuItemCallback(`Google (${response.data.username})`);
            }
            } else {
            if (setMenuItemCallback != null) {
                setMenuItemCallback('Google (Connect)');
            }
        }

        return response;
    } catch (error) {
        console.log(error);
    }
}