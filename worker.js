self.onmessage = function (event) {
    let data = event.data;
    let type = data.type;
    let message = data.data;
    let tmp = [];

    switch (type) {
        case "SMA":
            self.postMessage(WcalcSMA(message[0], message[1], message[2]));
            data = [];
            message = [];
            break;
        case "RSI":
            self.postMessage(WcalcRSI(message[0], message[1], message[2]));
            data = [];
            message = [];
            break;
        case "EMA":
            self.postMessage(WcalcEMA(message[0], message[1], message[2]));
            data = [];
            message = [];
            break;
    }
};

function WcalcSMA(arr, end, period) {
    let tmp = [];
    for (let point = 0; point < end; point++) {
        let sum = 0;

        if (point < period - 1) {
            tmp.push(0);
        } else {
            for (let i = point; i > point - period; i--) {
                sum += arr[i];
            }
            tmp.push(parseFloat((sum / period).toFixed(6)));
        }
    }

    return tmp;
}

function WcalcSMAPoint(arr, point, period) {
    let sum = 0;

    if (point < period - 1) {
        tmp.push(0)
    } else {
        for (let i = point; i > point - period; i--) {
            sum += arr[i];
        }
    }

    return parseFloat((sum / period).toFixed(6));
}

function WcalcRSI(arr, end, period) {
    let tmp = [], table = [];
    for (let point = 0; point < end; point++) {
        let change, data = {};

        if (point < 1) {
            table.push({rsi: 0});
            tmp.push(0);
            continue;
        }

        change = arr[point] - arr[point - 1];

        if (change < 0)
            data.loss = change * (-1);
        else if (change > 0)
            data.gain = change;
        else
            data.gain = 0;

        if (point < period) {
            data.rsi = 0;
            table.push(data);
        } else {
            table.push(data);

            table[point].avgGain = WcalcAVGGain(table, point - period, point, "gain");
            table[point].avgLoss = WcalcAVGGain(table, point - period, point, "loss");

            let RS = data.avgGain / data.avgLoss;

            table[point].rsi = 100 - (100 / (1 + RS));
        }

        tmp.push(parseFloat(table[point].rsi.toFixed(6)));
    }

    return tmp;
}

function WcalcAVGGain(arr, lo, hi, tag) {
    let sum = 0;

    if (hi < lo)
        return 0;

    if (lo == 0) {
        for (let i = lo; i <= hi; i++) {
            if (arr[i].hasOwnProperty(tag)) {
                sum += arr[i][tag];
            }
        }

        return sum / (hi - lo);
    } else {
        if (tag == "gain") {
            let gain = (arr[hi].hasOwnProperty("gain")) ? arr[hi]["gain"] : 0;
            return (arr[hi - 1]["avgGain"] * 13 + gain) / 14;
        } else if (tag == "loss") {
            let loss = (arr[hi].hasOwnProperty("loss")) ? arr[hi]["loss"] : 0;
            return (arr[hi - 1]["avgLoss"] * 13 + loss) / 14;
        }
    }
}

let emaMultiplierMap = new Map([]);

function WcalcEMA(arr, end, period) {
    let tmp = [];

    for (let point = 0; point < end; point++) {
        let multiplier = emaMultiplierMap.get(period);

        if (!isFinite(multiplier)) {
            multiplier = 2.0 / (1 + period);
            emaMultiplierMap.set(period, multiplier);
        }

        if (point < period - 1) {
            tmp.push(0);
        } else if (point == period - 1) {
            tmp.push(parseFloat((WcalcSMAPoint(arr, point, period)).toFixed(6)));
        } else {
            tmp.push(parseFloat(((arr[point] * multiplier) + tmp[point - 1] * (1 - multiplier)).toFixed(6)));
        }
    }

    return tmp;
}
