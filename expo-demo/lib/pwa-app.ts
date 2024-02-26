import AsyncStorage from "@react-native-async-storage/async-storage";
import sodium from "react-native-libsodium";

import { generateAsymmetricKey } from "./pwa-keys";
import { toMnemonic } from "./pwa-mnemonic";

import type { LoginSession } from "@/context/LoginSessionContext";

export async function readStoredProfiles() {
	return JSON.parse((await AsyncStorage.getItem("profiles")) || "null") || {};
}

export async function register(
	profileName: string,
	registrationInfo: { firstName: string; lastName: string; email: string }
) {
	var keyInfo = await generateAsymmetricKey();
	const loginSession = {
		profileName,
		...keyInfo,
	};
	await saveLoginSession(loginSession);

	// if (await saveProfile(profileName, registrationInfo)) {
	// 	currentProfile = registrationInfo;
	// } else {
	// 	clearLoginSession();
	// 	await showError("Profile registration not saved. Please try again.");
	// 	return promptWelcome();
	// }

	var loginKeyWords = (await toMnemonic(keyInfo.iv)).join(" ");
	// await confirmRegistration(profileName,loginKeyWords);

	return { loginSession, loginKeyWords };
	return showProfile();
}

async function saveLoginSession(session: LoginSession) {
	// loginSession = session;
	try {
		await AsyncStorage.setItem(
			"login-session",
			JSON.stringify(packKeyInfo(session))
		);
	} catch (e) {
		// saving error
	}
	// window.sessionStorage.setItem(
	// 	"login-session",
	// 	JSON.stringify(packKeyInfo(session))
	// );
}

function packKeyInfo(keyInfo) {
	return Object.assign(
		{ ...keyInfo },
		Object.fromEntries(
			Object.entries(keyInfo)
				.filter(([key]) =>
					[
						"publicKey",
						"privateKey",
						"encPK",
						"encSK",
						"iv",
					].includes(key)
				)
				.map(([key, value]) => [
					key,
					sodium.to_base64(value, sodium.base64_variants.ORIGINAL),
				])
		)
	);
}
