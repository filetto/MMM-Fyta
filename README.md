### MMM-Ftya 

## A magic mirror module fetching plant status from Fyta sensors

This module is a very simplistic implementation so far, there is no warranty for funcationality. Please use at your own risk. 

To use add this config to your MMM config:

{
		module: "MMM-fyta",
		position: "bottom_right",
		config: {
			email: YOUR FYTA USER EMAIL,
			password: YOUR FYTA PASSWORD,
			reloadIntervalInMS: 1 * 60 * 60 * 1000 // Refresh data every hour. This is the interval your Fyta hub updates, fetching faster should not be necessary
		}
}


