// Sample dataset (Date, Value)
const data = [
    { date: '2023-01-01', value: 100 },
    { date: '2023-01-02', value: 110 },
    { date: '2023-01-03', value: 120 },
    { date: '2023-01-04', value: 130 },
    { date: '2023-01-05', value: 140 },
    { date: '2023-01-06', value: 150 },
    { date: '2023-01-07', value: 160 },
    { date: '2023-01-08', value: 170 },
    { date: '2023-01-09', value: 180 },
    { date: '2023-01-10', value: 190 },
];

// Perform BMA by combining predictions from ARIMA, LSTM, and a seasonal model
function performForecast() {
    const steps = 5; // Number of steps to forecast
    const arimaForecast = simpleARIMA(data.map(d => d.value), steps);
    const seasonalForecast = simpleSeasonalForecast(data.map(d => d.value), steps);
    const lstmForecast = simpleLSTM(data.map(d => d.value), steps); // Replace with your LSTM logic

    // Calculate RMSE for each model
    const validationData = data.slice(-steps).map(d => d.value); // Last `steps` entries for validation
    const rmseARIMA = calculateRMSE(arimaForecast, validationData);
    const rmseLSTM = calculateRMSE(lstmForecast, validationData);
    const rmseSeasonal = calculateRMSE(seasonalForecast, validationData);

    // Compute BMA weights
    const sumInverseRMSE = (1 / rmseARIMA) + (1 / rmseLSTM) + (1 / rmseSeasonal);
    const weightARIMA = (1 / rmseARIMA) / sumInverseRMSE;
    const weightLSTM = (1 / rmseLSTM) / sumInverseRMSE;
    const weightSeasonal = (1 / rmseSeasonal) / sumInverseRMSE;

    // Combine forecasts using BMA
    const combinedForecast = [];
    for (let i = 0; i < steps; i++) {
        const combinedValue = weightARIMA * arimaForecast[i] +
                              weightLSTM * lstmForecast[i] +
                              weightSeasonal * seasonalForecast[i];
        combinedForecast.push(combinedValue);
    }

    // Display results
    document.getElementById("forecastResult").innerText = combinedForecast.join(", ");
    document.getElementById("weightARIMA").innerText = weightARIMA.toFixed(4);
    document.getElementById("weightLSTM").innerText = weightLSTM.toFixed(4);
    document.getElementById("weightSeasonal").innerText = weightSeasonal.toFixed(4);
}

// Simple ARIMA-like forecast (moving average for simplicity)
function simpleARIMA(data, steps) {
    const forecast = [];
    for (let i = 0; i < steps; i++) {
        const avg = data.slice(-5).reduce((sum, val) => sum + val, 0) / 5; // Last 5 values
        forecast.push(avg);
        data.push(avg); // Append forecasted value for next prediction
    }
    return forecast;
}

// Simple Seasonal Forecast (average of historical data)
function simpleSeasonalForecast(data, steps) {
    const avg = data.reduce((sum, val) => sum + val, 0) / data.length;
    return new Array(steps).fill(avg);
}

// Simple LSTM-like forecast (using average for simplicity)
function simpleLSTM(data, steps) {
    const forecast = [];
    const avg = data.reduce((sum, val) => sum + val, 0) / data.length;
    for (let i = 0; i < steps; i++) {
        forecast.push(avg);
    }
    return forecast;
}

// Calculate Root Mean Square Error (RMSE)
function calculateRMSE(forecast, actual) {
    const error = forecast.map((val, idx) => Math.pow(val - actual[idx], 2));
    return Math.sqrt(error.reduce((sum, val) => sum + val, 0) / actual.length);
}
