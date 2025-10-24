document.addEventListener('DOMContentLoaded', () => {
  const amountInput = document.getElementById('amount');
  const fromCurrency = document.getElementById('fromCurrency');
  const toCurrency = document.getElementById('toCurrency');
  const swapButton = document.getElementById('swapButton');
  const convertButton = document.getElementById('convertButton');
  const resetButton = document.getElementById('resetButton');
  const refreshButton = document.getElementById('refreshButton');
  const toggleHistory = document.getElementById('toggleHistory');
  const historyList = document.getElementById('historyList');
  const rateChartCanvas = document.getElementById('rateChart');
  const resultAmount = document.getElementById('resultAmount');
  const rateInfo = document.getElementById('rateInfo');
  const lastUpdated = document.getElementById('lastUpdated');
  const loader = document.getElementById('loader');
  const errorMessage = document.getElementById('errorMessage');
  const errorText = document.getElementById('errorText');

  let rateChart;
  const exchangeCache = {};
  const CACHE_DURATION = 5 * 60 * 1000;

  const fallbackRates = {
  
    USD: { USD:1, EUR:0.85, GBP:0.73, JPY:110.54, CAD:1.25, AUD:1.34, CHF:0.92, CNY:6.47, INR:74.5, BRL:5.25, NZD:1.42, SEK:8.67, NOK:8.93, MXN:20.1, SGD:1.35, HKD:7.79, KRW:1185, ZAR:14.6, TRY:18.7, RUB:74.1, PLN:3.77, HUF:320, DKK:6.3, CZK:21.5, MYR:4.4, THB:33.5, IDR:14850, PHP:55.8, ILS:3.6, SAR:3.75, AED:3.67, COP:4800, CLP:810, PKR:277, EGP:30.9, NGN:411, BDT:104, VND:23600, RON:4.2, ARS:185, KWD:0.30, OMR:0.38, QAR:3.64, LKR: 300, GHS: 12.5, KZT: 470, TWD: 30.5, UAH: 37, ISK: 140, BHD: 0.38, DZD: 135, IQD: 1310, JOD: 0.71, MAD: 10.2, PAB: 1, PEN: 3.7, UYU: 39.5, VES: 36, XOF: 615, VEF: 24850 },
    EUR: { USD:1.18, EUR:1, GBP:0.86, JPY:130.21, CAD:1.47, AUD:1.58, CHF:1.08, CNY:7.62, INR:87.65, BRL:6.18, NZD:1.67, SEK:10.2, NOK:10.5, MXN:23.6, SGD:1.59, HKD:9.14, KRW:1380, ZAR:17.0, TRY:21.8, RUB:86.0, PLN:4.38, HUF:370, DKK:7.3, CZK:24.8, MYR:5.1, THB:38.7, IDR:17100, PHP:64.3, ILS:4.1, SAR:4.3, AED:4.2, COP:5650, CLP:950, PKR:325, EGP:36.3, NGN:482, BDT:122, VND:27700, RON:4.9, ARS:216, KWD:0.35, OMR:0.42, QAR:4.2, LKR: 350, GHS: 14.7, KZT: 550, TWD: 35.8, UAH: 43.5, ISK: 165, BHD: 0.45, DZD: 160, IQD: 1540, JOD: 0.84, MAD: 12.0, PAB: 1.18, PEN: 4.37, UYU: 46.5, VES: 42.5, XOF: 725, VEF: 29235 },
    GBP: { USD:1.37, EUR:1.16, GBP:1, JPY:151.28, CAD:1.71, AUD:1.84, CHF:1.26, CNY:8.86, INR:101.92, BRL:7.19, NZD:1.95, SEK:11.9, NOK:12.2, MXN:27.3, SGD:1.84, HKD:10.6, KRW:1600, ZAR:19.7, TRY:25.3, RUB:100.0, PLN:5.1, HUF:430, DKK:8.5, CZK:28.5, MYR:5.9, THB:44.3, IDR:19500, PHP:73.2, ILS:4.7, SAR:5.0, AED:4.9, COP:6600, CLP:1110, PKR:380, EGP:42.4, NGN:563, BDT:142, VND:32400, RON:5.8, ARS:256, KWD:0.41, OMR:0.49, QAR:4.9, LKR: 407, GHS: 17.1, KZT: 638, TWD: 41.7, UAH: 50.5, ISK: 192, BHD: 0.52, DZD: 186, IQD: 1780, JOD: 0.98, MAD: 14.0, PAB: 1.37, PEN: 5.07, UYU: 54.0, VES: 49.3, XOF: 843, VEF: 34000 },
    JPY: { USD:0.0091, EUR:0.0077, GBP:0.0066, JPY:1, CAD:0.011, AUD:0.012, CHF:0.0083, CNY:0.058, INR:0.67, BRL:0.047, NZD:0.013, SEK:0.077, NOK:0.081, MXN:0.18, SGD:0.012, HKD:0.063, KRW:10.6, ZAR:0.13, TRY:0.17, RUB:0.66, PLN:0.034, HUF:2.83, DKK:0.053, CZK:0.185, MYR:0.038, THB:0.31, IDR:134, PHP:0.52, ILS:0.030, SAR:0.034, AED:0.033, COP:4.35, CLP:0.075, PKR:0.024, EGP:0.0037, NGN:0.035, BDT:0.0056, VND:214, RON:0.038, ARS:0.014, KWD:0.00027, OMR:0.00033, QAR:0.031, LKR: 2.7, GHS: 0.11, KZT: 4.25, TWD: 0.275, UAH: 0.33, ISK: 1.27, BHD: 0.0034, DZD: 1.22, IQD: 11.85, JOD: 0.0064, MAD: 0.092, PAB: 0.0091, PEN: 0.0335, UYU: 0.357, VES: 0.326, XOF: 5.56, VEF: 225 },
    CAD: { USD:0.8, EUR:0.68, GBP:0.58, JPY:90.91, CAD:1, AUD:1.07, CHF:0.74, CNY:5.18, INR:59.6, BRL:4.2, NZD:1.11, SEK:6.96, NOK:7.1, MXN:16.0, SGD:1.08, HKD:6.2, KRW:840, ZAR:10.3, TRY:13.3, RUB:52.7, PLN:2.53, HUF:215, DKK:4.0, CZK:15.8, MYR:3.3, THB:25.3, IDR:10800, PHP:42.0, ILS:2.7, SAR:3.2, AED:3.0, COP:3090, CLP:520, PKR:177, EGP:19.8, NGN:262, BDT:64, VND:13800, RON:2.9, ARS:128, KWD:0.21, OMR:0.26, QAR:2.6, LKR: 240, GHS: 10, KZT: 376, TWD: 24.4, UAH: 29.6, ISK: 112, BHD: 0.30, DZD: 108, IQD: 1048, JOD: 0.57, MAD: 8.16, PAB: 0.8, PEN: 2.96, UYU: 31.6, VES: 28.8, XOF: 492, VEF: 19880 },
    AUD: { USD:0.75, EUR:0.63, GBP:0.54, JPY:83.33, CAD:0.93, AUD:1, CHF:0.69, CNY:4.83, INR:55.6, BRL:3.92, NZD:1.04, SEK:6.52, NOK:6.65, MXN:15.0, SGD:1.01, HKD:5.82, KRW:790, ZAR:9.7, TRY:12.5, RUB:49.5, PLN:2.37, HUF:201, DKK:3.8, CZK:15.0, MYR:3.1, THB:23.0, IDR:9800, PHP:38.2, ILS:2.5, SAR:2.9, AED:2.85, COP:2690, CLP:452, PKR:154, EGP:17.2, NGN:228, BDT:56, VND:12000, RON:2.5, ARS:110, KWD:0.18, OMR:0.23, QAR:2.4, LKR: 224, GHS: 9.3, KZT: 350, TWD: 22.8, UAH: 27.7, ISK: 105, BHD: 0.28, DZD: 101, IQD: 978, JOD: 0.53, MAD: 7.6, PAB: 0.75, PEN: 2.77, UYU: 29.6, VES: 27, XOF: 460, VEF: 18590 },
    CHF: { USD:1.09, EUR:0.93, GBP:0.79, JPY:120.48, CAD:1.35, AUD:1.45, CHF:1, CNY:7.03, INR:80.9, BRL:5.7, NZD:1.46, SEK:9.18, NOK:9.38, MXN:21.0, SGD:1.42, HKD:8.2, KRW:1110, ZAR:13.7, TRY:17.7, RUB:70.0, PLN:3.35, HUF:295, DKK:5.6, CZK:22.1, MYR:4.4, THB:33.3, IDR:14100, PHP:55.2, ILS:3.6, SAR:3.7, AED:3.65, COP:4210, CLP:707, PKR:241, EGP:26.9, NGN:356, BDT:88, VND:18700, RON:3.5, ARS:157, KWD:0.26, OMR:0.33, QAR:3.5, LKR: 273, GHS: 11.4, KZT: 429, TWD: 27.9, UAH: 33.8, ISK: 129, BHD: 0.35, DZD: 124, IQD: 1202, JOD: 0.65, MAD: 9.36, PAB: 1.09, PEN: 4.04, UYU: 43.2, VES: 39.4, XOF: 673, VEF: 27200 },
    CNY: { USD:0.15, EUR:0.13, GBP:0.11, JPY:17.24, CAD:0.19, AUD:0.21, CHF:0.14, CNY:1, INR:11.5, BRL:0.81, NZD:0.22, SEK:1.3, NOK:1.34, MXN:3.1, SGD:0.21, HKD:1.17, KRW:158, ZAR:2.0, TRY:2.52, RUB:10.0, PLN:0.48, HUF:42, DKK:0.8, CZK:3.1, MYR:0.57, THB:4.7, IDR:1980, PHP:7.7, ILS:0.50, SAR:0.51, AED:0.50, COP:580, CLP:97, PKR:33, EGP:3.7, NGN:49, BDT:6.5, VND:1370, RON:0.26, ARS:12, KWD:0.019, OMR:0.025, QAR:0.52, LKR: 46.3, GHS: 1.93, KZT: 72.6, TWD: 4.7, UAH: 5.7, ISK: 21.6, BHD: 0.049, DZD: 20.8, IQD: 202, JOD: 0.11, MAD: 1.57, PAB: 0.15, PEN: 0.57, UYU: 6.1, VES: 5.56, XOF: 95, VEF: 3840 },
    INR: { USD:0.013, EUR:0.011, GBP:0.0098, JPY:1.49, CAD:0.017, AUD:0.018, CHF:0.012, CNY:0.087, INR:1, BRL:0.07, NZD:0.019, SEK:0.12, NOK:0.12, MXN:0.26, SGD:0.018, HKD:0.096, KRW:13.7, ZAR:0.16, TRY:0.22, RUB:0.87, PLN:0.042, HUF:3.4, DKK:0.20, CZK:0.76, MYR:0.14, THB:1.1, IDR:202, PHP:7.3, ILS:0.47, SAR:0.50, AED:0.49, COP:578, CLP:97, PKR:33, EGP:3.7, NGN:49, BDT:6.5, VND:1370, RON:0.26, ARS:12, KWD:0.019, OMR:0.025, QAR:0.52, LKR: 4.0, GHS: 0.168, KZT: 6.3, TWD: 0.41, UAH: 0.5, ISK: 1.88, BHD: 0.005, DZD: 1.81, IQD: 17.6, JOD: 0.0095, MAD: 0.137, PAB: 0.013, PEN: 0.049, UYU: 0.53, VES: 0.48, XOF: 8.25, VEF: 333 },
    BRL: { USD:0.19, EUR:0.16, GBP:0.14, JPY:21.28, CAD:0.24, AUD:0.26, CHF:0.18, CNY:1.23, INR:14.2, BRL:1, NZD:0.27, SEK:1.56, NOK:1.59, MXN:3.5, SGD:0.26, HKD:1.3, KRW:18.7, ZAR:0.22, TRY:0.33, RUB:4.3, PLN:0.5, HUF:39, DKK:0.67, CZK:2.9, MYR:0.53, THB:4.3, IDR:780, PHP:30.6, ILS:1.95, SAR:2.0, AED:1.95, COP:315, CLP:53, PKR:18, EGP:2.1, NGN:27, BDT:3.5, VND:740, RON:0.14, ARS:6.0, KWD:0.0097, OMR:0.012, QAR:1.0, LKR: 57.1, GHS: 2.38, KZT: 89.5, TWD: 5.8, UAH: 7.0, ISK: 26.6, BHD: 0.063, DZD: 25.7, IQD: 250, JOD: 0.135, MAD: 1.94, PAB: 0.19, PEN: 0.70, UYU: 7.5, VES: 6.86, XOF: 117, VEF: 4730 },
    NZD: { USD:0.7, EUR:0.6, GBP:0.52, JPY:78, CAD:0.88, AUD:0.96, CHF:0.66, CNY:4.5, INR:52, BRL:3.7, NZD:1, SEK:6.25, NOK:6.4, MXN:14.5, SGD:0.97, HKD:5.6, KRW:770, ZAR:9.4, TRY:12.0, RUB:48, PLN:2.3, HUF:196, DKK:3.7, CZK:14.0, MYR:2.9, THB:21.5, IDR:9150, PHP:35.5, ILS:2.3, SAR:2.7, AED:2.65, COP:2520, CLP:425, PKR:145, EGP:16.3, NGN:215, BDT:53, VND:11200, RON:2.3, ARS:102, KWD:0.17, OMR:0.22, QAR:2.3, LKR: 211, GHS: 8.8, KZT: 331, TWD: 21.5, UAH: 26.1, ISK: 99, BHD: 0.26, DZD: 95, IQD: 922, JOD: 0.50, MAD: 7.18, PAB: 0.7, PEN: 2.59, UYU: 27.6, VES: 25.2, XOF: 430, VEF: 17350 },
    SEK: { USD:0.12, EUR:0.098, GBP:0.084, JPY:12.7, CAD:0.16, AUD:0.17, CHF:0.14, CNY:0.74, INR:8.7, BRL:0.059, NZD:0.16, SEK:1, NOK:1.02, MXN:2.33, SGD:0.16, HKD:0.9, KRW:123, ZAR:1.5, TRY:1.9, RUB:13.5, PLN:0.49, HUF:32, DKK:0.77, CZK:3.24, MYR:0.67, THB:5.5, IDR:2350, PHP:9.1, ILS:0.57, SAR:0.6, AED:0.58, COP:418, CLP:71, PKR:24, EGP:3.0, NGN:39, BDT:5.2, VND:1130, RON:0.23, ARS:10, KWD:0.016, OMR:0.021, QAR:0.57, LKR: 34.6, GHS: 1.44, KZT: 54, TWD: 3.5, UAH: 4.25, ISK: 16, BHD: 0.043, DZD: 15.6, IQD: 151, JOD: 0.083, MAD: 1.19, PAB: 0.12, PEN: 0.44, UYU: 4.7, VES: 4.28, XOF: 73, VEF: 2950 },
  

    PLN: { USD:0.265, EUR:0.228, GBP:0.196, JPY:29.41, CAD:0.395, AUD:0.422, CHF:0.297, CNY:2.1, INR:20, BRL:1.39, NZD:0.5, SEK:2.12, NOK:2.18, MXN:5.33, SGD:0.35, HKD:2.0, KRW:330, ZAR:4.1, TRY:5.0, RUB:19.5, PLN:1, HUF:85, DKK:1.67, CZK:5.7, MYR:1.15, THB:8.9, IDR:3950, PHP:14.8, ILS:0.95, SAR:1.0, AED:0.97, COP:1273, CLP:215, PKR:72, EGP:8.0, NGN:106, BDT:27, VND:6250, RON:1.11, ARS:50, KWD:0.08, OMR:0.1, QAR:0.96, LKR: 80, GHS: 3.3, KZT: 125, TWD: 8.1, UAH: 9.8, ISK: 37, BHD: 0.1, DZD: 36, IQD: 347, JOD: 0.19, MAD: 2.7, PAB: 0.265, PEN: 0.98, UYU: 10.5, VES: 9.6, XOF: 164, VEF: 6600 },
    HUF: { USD:0.0031, EUR:0.0027, GBP:0.0023, JPY:0.35, CAD:0.0046, AUD:0.005, CHF:0.0034, CNY:0.024, INR:0.23, BRL:0.012, NZD:0.005, SEK:0.012, NOK:0.011, MXN:0.027, SGD:0.0042, HKD:0.025, KRW:3.9, ZAR:0.045, TRY:0.057, RUB:0.23, PLN:0.0117, HUF:1, DKK:0.019, CZK:0.067, MYR:0.013, THB:0.10, IDR:46, PHP:0.17, ILS:0.011, SAR:0.011, AED:0.011, COP:15, CLP:2.5, PKR:0.85, EGP:0.095, NGN:1.25, BDT:0.32, VND:73.7, RON:0.013, ARS:0.59, KWD:0.00094, OMR:0.0012, QAR:0.0114, LKR: 0.94, GHS: 0.039, KZT: 1.47, TWD: 0.095, UAH: 0.115, ISK: 0.44, BHD: 0.0012, DZD: 0.42, IQD: 4.0, JOD: 0.0022, MAD: 0.032, PAB: 0.0031, PEN: 0.0115, UYU: 0.123, VES: 0.11, XOF: 1.87, VEF: 75 },
    DKK: { USD:0.158, EUR:0.137, GBP:0.117, JPY:18.87, CAD:0.25, AUD:0.263, CHF:0.178, CNY:1.25, INR:9.7, BRL:0.67, NZD:0.27, SEK:1.3, NOK:1.34, MXN:3.2, SGD:0.21, HKD:1.2, KRW:188, ZAR:2.3, TRY:3.0, RUB:11.8, PLN:0.6, HUF:50.7, DKK:1, CZK:3.4, MYR:0.7, THB:5.3, IDR:2357, PHP:8.8, ILS:0.57, SAR:0.6, AED:0.58, COP:760, CLP:128, PKR:43, EGP:4.9, NGN:65, BDT:16.5, VND:3750, RON:0.67, ARS:30, KWD:0.048, OMR:0.06, QAR:0.58, LKR: 47.6, GHS: 1.98, KZT: 74.6, TWD: 4.84, UAH: 5.87, ISK: 22.2, BHD: 0.05, DZD: 21.4, IQD: 208, JOD: 0.11, MAD: 1.62, PAB: 0.158, PEN: 0.58, UYU: 6.2, VES: 5.6, XOF: 96, VEF: 3870 },
    CZK: { USD:0.0465, EUR:0.04, GBP:0.035, JPY:5.36, CAD:0.063, AUD:0.067, CHF:0.045, CNY:0.32, INR:2.9, BRL:0.21, NZD:0.07, SEK:0.3, NOK:0.31, MXN:0.93, SGD:0.063, HKD:0.36, KRW:55, ZAR:0.68, TRY:0.87, RUB:3.4, PLN:0.175, HUF:14.9, DKK:0.294, CZK:1, MYR:0.2, THB:1.55, IDR:690, PHP:2.6, ILS:0.17, SAR:0.174, AED:0.17, COP:223, CLP:37.7, PKR:12.9, EGP:1.44, NGN:19.1, BDT:4.8, VND:1100, RON:0.195, ARS:8.6, KWD:0.0139, OMR:0.0176, QAR:0.169, LKR: 14, GHS: 0.58, KZT: 22, TWD: 1.42, UAH: 1.72, ISK: 6.5, BHD: 0.015, DZD: 6.28, IQD: 60.9, JOD: 0.033, MAD: 0.47, PAB: 0.0465, PEN: 0.172, UYU: 1.83, VES: 1.67, XOF: 28.6, VEF: 1150 },
    MYR: { USD:0.227, EUR:0.196, GBP:0.169, JPY:26.0, CAD:0.30, AUD:0.32, CHF:0.227, CNY:1.75, INR:7.1, BRL:1.88, NZD:0.34, SEK:1.5, NOK:1.6, MXN:4.6, SGD:0.3, HKD:1.77, KRW:269, ZAR:3.3, TRY:4.25, RUB:16.8, PLN:0.87, HUF:72.7, DKK:1.43, CZK:4.9, MYR:1, THB:7.6, IDR:3375, PHP:12.7, ILS:0.82, SAR:0.85, AED:0.83, COP:1090, CLP:183, PKR:62.9, EGP:7.0, NGN:93, BDT:23.6, VND:5360, RON:0.95, ARS:42, KWD:0.068, OMR:0.086, QAR:0.82, LKR: 68, GHS: 2.84, KZT: 106, TWD: 6.9, UAH: 8.4, ISK: 31.8, BHD: 0.088, DZD: 30.7, IQD: 298, JOD: 0.16, MAD: 2.3, PAB: 0.227, PEN: 0.84, UYU: 9.0, VES: 8.2, XOF: 140, VEF: 5650 },
    THB: { USD:0.03, EUR:0.026, GBP:0.023, JPY:3.2, CAD:0.04, AUD:0.043, CHF:0.03, CNY:0.21, INR:0.9, BRL:0.23, NZD:0.046, SEK:0.18, NOK:0.19, MXN:0.6, SGD:0.04, HKD:0.23, KRW:35.4, ZAR:0.43, TRY:0.56, RUB:2.2, PLN:0.112, HUF:9.5, DKK:0.188, CZK:0.64, MYR:0.13, THB:1, IDR:443, PHP:1.67, ILS:0.11, SAR:0.112, AED:0.11, COP:143, CLP:24, PKR:8.2, EGP:0.92, NGN:12.2, BDT:3.1, VND:700, RON:0.125, ARS:5.5, KWD:0.009, OMR:0.011, QAR:0.11, LKR: 9, GHS: 0.37, KZT: 14, TWD: 0.91, UAH: 1.1, ISK: 4.2, BHD: 0.011, DZD: 4.0, IQD: 38, JOD: 0.02, MAD: 0.29, PAB: 0.03, PEN: 0.11, UYU: 1.18, VES: 1.08, XOF: 18.3, VEF: 740 },
    IDR: { USD:0.000067, EUR:0.000058, GBP:0.000051, JPY:0.0075, CAD:0.000093, AUD:0.0001, CHF:0.000071, CNY:0.0005, INR:0.005, BRL:0.0013, NZD:0.00011, SEK:0.00042, NOK:0.00045, MXN:0.00135, SGD:0.00009, HKD:0.00045, KRW:0.08, ZAR:0.001, TRY:0.0012, RUB:0.0049, PLN:0.00025, HUF:0.022, DKK:0.00042, CZK:0.00145, MYR:0.0003, THB:0.0023, IDR:1, PHP:0.00375, ILS:0.00024, SAR:0.00025, AED:0.00024, COP:0.32, CLP:0.054, PKR:0.0186, EGP:0.002, NGN:0.027, BDT:0.0069, VND:1.6, RON:0.00028, ARS:0.012, KWD:0.00002, OMR:0.000025, QAR:0.00024, LKR: 0.02, GHS: 0.00084, KZT: 0.0316, TWD: 0.00205, UAH: 0.0025, ISK: 0.0094, BHD: 0.000026, DZD: 0.002, IQD: 0.02, JOD: 0.000048, MAD: 0.00069, PAB: 0.000067, PEN: 0.00025, UYU: 0.0027, VES: 0.0024, XOF: 0.042, VEF: 1.67 },
    PHP: { USD:0.0179, EUR:0.0155, GBP:0.0136, JPY:1.92, CAD:0.0238, AUD:0.026, CHF:0.018, CNY:0.13, INR:0.13, BRL:0.033, NZD:0.028, SEK:0.11, NOK:0.12, MXN:0.36, SGD:0.024, HKD:0.14, KRW:21.2, ZAR:0.26, TRY:0.33, RUB:1.32, PLN:0.067, HUF:5.8, DKK:0.11, CZK:0.38, MYR:0.079, THB:0.6, IDR:26.7, PHP:1, ILS:0.064, SAR:0.067, AED:0.066, COP:110, CLP:18.4, PKR:6.3, EGP:0.7, NGN:9.3, BDT:2.3, VND:500, RON:0.09, ARS:4.0, KWD:0.0054, OMR:0.0068, QAR:0.065, LKR: 6.0, GHS: 0.25, KZT: 9.4, TWD: 0.61, UAH: 0.74, ISK: 2.8, BHD: 0.0076, DZD: 2.5, IQD: 24.5, JOD: 0.013, MAD: 0.19, PAB: 0.0179, PEN: 0.066, UYU: 0.71, VES: 0.64, XOF: 11, VEF: 445 },
    ILS: { USD:0.278, EUR:0.24, GBP:0.21, JPY:33.4, CAD:0.46, AUD:0.5, CHF:0.35, CNY:2.47, INR:21.0, BRL:1.75, NZD:0.6, SEK:4.2, NOK:4.3, MXN:7.5, SGD:0.41, HKD:2.16, KRW:330, ZAR:4.1, TRY:5.3, RUB:20.5, PLN:1.05, HUF:90, DKK:1.75, CZK:6.0, MYR:1.22, THB:9.5, IDR:4100, PHP:15.5, ILS:1, SAR:1.04, AED:1.0, COP:1330, CLP:225, PKR:77, EGP:8.6, NGN:114, BDT:29, VND:6600, RON:1.18, ARS:52, KWD:0.083, OMR:0.10, QAR:1.0, LKR: 83.3, GHS: 3.47, KZT: 130, TWD: 8.4, UAH: 10.2, ISK: 38.8, BHD: 0.11, DZD: 38.3, IQD: 371, JOD: 0.2, MAD: 2.7, PAB: 0.278, PEN: 1.03, UYU: 11, VES: 10, XOF: 171, VEF: 6900 },
    
    LKR: { USD:0.0033, EUR:0.0028, GBP:0.0025, JPY:0.37, CAD:0.0042, AUD:0.0045, CHF:0.0038, CNY:0.026, INR:0.25, BRL:0.0175, NZD:0.0047, SEK:0.029, NOK:0.03, MXN:0.067, SGD:0.0045, HKD:0.026, KRW:3.95, ZAR:0.049, TRY:0.062, RUB:0.24, PLN:0.0125, HUF:1.06, DKK:0.021, CZK:0.07, MYR:0.015, THB:0.11, IDR:50, PHP:0.18, ILS:0.012, SAR:0.0125, AED:0.0122, COP:16, CLP:2.7, PKR:0.92, EGP:0.10, NGN:1.37, BDT:0.35, VND:78.5, RON:0.014, ARS:0.62, KWD:0.001, OMR:0.0013, QAR:0.012, LKR:1, GHS: 0.042, KZT: 1.57, TWD: 0.1, UAH: 0.12, ISK: 0.47, BHD: 0.0013, DZD: 0.45, IQD: 4.36, JOD: 0.0024, MAD: 0.034, PAB: 0.0033, PEN: 0.012, UYU: 0.13, VES: 0.12, XOF: 2.05, VEF: 82.8 },
    GHS: { USD:0.08, EUR:0.068, GBP:0.058, JPY:9.0, CAD:0.1, AUD:0.104, CHF:0.074, CNY:0.52, INR:6, BRL:0.4, NZD:0.11, SEK:0.16, NOK:0.18, MXN:1.6, SGD:0.11, HKD:0.62, KRW:95, ZAR:1.2, TRY:1.5, RUB:6.0, PLN:0.3, HUF:24, DKK:0.49, CZK:1.72, MYR:0.35, THB:2.7, IDR:1200, PHP:4.5, ILS:0.29, SAR:0.3, AED:0.29, COP:384, CLP:65, PKR:22, EGP:2.6, NGN:33, BDT:8.3, VND:2000, RON:0.33, ARS:14.8, KWD:0.024, OMR:0.03, QAR:0.29, LKR: 24, GHS:1, KZT: 37.6, TWD: 2.44, UAH: 3.0, ISK: 11.2, BHD: 0.03, DZD: 10.8, IQD: 105, JOD: 0.057, MAD: 0.82, PAB: 0.08, PEN: 0.296, UYU: 3.16, VES: 2.88, XOF: 49.2, VEF: 1988 },
    KZT: { USD:0.0021, EUR:0.0018, GBP:0.0016, JPY:0.235, CAD:0.0026, AUD:0.0028, CHF:0.0023, CNY:0.014, INR:0.158, BRL:0.011, NZD:0.003, SEK:0.0185, NOK:0.019, MXN:0.043, SGD:0.0029, HKD:0.0165, KRW:2.5, ZAR:0.03, TRY:0.04, RUB:0.157, PLN:0.008, HUF:0.68, DKK:0.0134, CZK:0.045, MYR:0.0094, THB:0.071, IDR:31.6, PHP:0.039, ILS:0.0076, SAR:0.008, AED:0.0078, COP:10.2, CLP:1.72, PKR:0.59, EGP:0.065, NGN:0.87, BDT:0.22, VND:50, RON:0.0089, ARS:0.4, KWD:0.00064, OMR:0.0008, QAR:0.0077, LKR: 0.63, GHS: 0.026, KZT:1, TWD: 0.065, UAH: 0.079, ISK: 0.3, BHD: 0.0008, DZD: 0.287, IQD: 2.78, JOD: 0.0015, MAD: 0.0217, PAB: 0.0021, PEN: 0.0078, UYU: 0.084, VES: 0.076, XOF: 1.3, VEF: 52.8 },
    TWD: { USD:0.0328, EUR:0.028, GBP:0.024, JPY:3.64, CAD:0.041, AUD:0.044, CHF:0.036, CNY:0.21, INR:2.44, BRL:0.17, NZD:0.046, SEK:0.28, NOK:0.29, MXN:0.66, SGD:0.044, HKD:0.25, KRW:38.8, ZAR:0.48, TRY:0.61, RUB:2.4, PLN:0.123, HUF:10.5, DKK:0.206, CZK:0.7, MYR:0.145, THB:1.1, IDR:488, PHP:1.64, ILS:0.12, SAR:0.123, AED:0.12, COP:157, CLP:26.5, PKR:9.0, EGP:1.0, NGN:13.5, BDT:3.4, VND:774, RON:0.137, ARS:6.0, KWD:0.0098, OMR:0.0125, QAR:0.12, LKR: 9.8, GHS: 0.41, KZT: 15.4, TWD:1, UAH: 1.21, ISK: 4.6, BHD: 0.0124, DZD: 4.4, IQD: 43, JOD: 0.023, MAD: 0.33, PAB: 0.0328, PEN: 0.12, UYU: 1.29, VES: 1.18, XOF: 20.1, VEF: 815 },
    UAH: { USD:0.027, EUR:0.023, GBP:0.02, JPY:3.03, CAD:0.033, AUD:0.036, CHF:0.029, CNY:0.175, INR:2.0, BRL:0.14, NZD:0.038, SEK:0.235, NOK:0.24, MXN:0.54, SGD:0.036, HKD:0.21, KRW:32, ZAR:0.39, TRY:0.5, RUB:1.9, PLN:0.10, HUF:8.7, DKK:0.17, CZK:0.58, MYR:0.119, THB:0.9, IDR:400, PHP:1.35, ILS:0.098, SAR:0.1, AED:0.098, COP:130, CLP:22, PKR:7.5, EGP:0.83, NGN:11.1, BDT:2.8, VND:640, RON:0.11, ARS:4.9, KWD:0.008, OMR:0.01, QAR:0.098, LKR: 8.1, GHS: 0.33, KZT: 12.6, TWD: 0.82, UAH:1, ISK: 3.8, BHD: 0.011, DZD: 3.6, IQD: 35.4, JOD: 0.019, MAD: 0.27, PAB: 0.027, PEN: 0.1, UYU: 1.06, VES: 0.97, XOF: 16.6, VEF: 672 },
    ISK: { USD:0.0071, EUR:0.006, GBP:0.0052, JPY:0.78, CAD:0.0089, AUD:0.0095, CHF:0.0077, CNY:0.046, INR:0.53, BRL:0.037, NZD:0.01, SEK:0.062, NOK:0.064, MXN:0.14, SGD:0.0096, HKD:0.056, KRW:8.4, ZAR:0.1, TRY:0.13, RUB:0.53, PLN:0.027, HUF:2.27, DKK:0.045, CZK:0.15, MYR:0.031, THB:0.24, IDR:106, PHP:0.35, ILS:0.026, SAR:0.027, AED:0.026, COP:34, CLP:5.8, PKR:1.98, EGP:0.22, NGN:2.9, BDT:0.74, VND:168, RON:0.03, ARS:1.3, KWD:0.0021, OMR:0.0027, QAR:0.026, LKR: 2.1, GHS: 0.089, KZT: 3.3, TWD: 0.217, UAH: 0.26, ISK:1, BHD: 0.0027, DZD: 0.77, IQD: 7.4, JOD: 0.004, MAD: 0.054, PAB: 0.0071, PEN: 0.026, UYU: 0.27, VES: 0.25, XOF: 4.3, VEF: 177 },
    BHD: { USD:2.63, EUR:2.25, GBP:1.92, JPY:2900, CAD:3.3, AUD:3.57, CHF:2.63, CNY:17.0, INR:200, BRL:13.5, NZD:3.7, SEK:23.2, NOK:23.7, MXN:53, SGD:3.55, HKD:20.5, KRW:3100, ZAR:38.4, TRY:49.2, RUB:195, PLN:9.8, HUF:842, DKK:15.8, CZK:54, MYR:11.3, THB:88, IDR:39400, PHP:148, ILS:9.5, SAR:9.8, AED:9.6, COP:12600, CLP:2130, PKR:729, EGP:81.3, NGN:1080, BDT:274, VND:62100, RON:11.0, ARS:490, KWD:0.8, OMR:1.0, QAR:9.8, LKR: 800, GHS: 33.3, KZT: 1240, TWD: 81.3, UAH: 98.7, ISK: 375, BHD:1, DZD: 355, IQD: 3450, JOD: 1.87, MAD: 27.0, PAB: 2.63, PEN: 9.7, UYU: 104, VES: 95, XOF: 1620, VEF: 65400 },
    DZD: { USD:0.0074, EUR:0.00625, GBP:0.0054, JPY:0.82, CAD:0.0092, AUD:0.0099, CHF:0.008, CNY:0.048, INR:0.55, BRL:0.039, NZD:0.0105, SEK:0.064, NOK:0.066, MXN:0.15, SGD:0.01, HKD:0.058, KRW:8.78, ZAR:0.108, TRY:0.138, RUB:0.54, PLN:0.027, HUF:2.38, DKK:0.047, CZK:0.16, MYR:0.032, THB:0.25, IDR:125, PHP:0.39, ILS:0.026, SAR:0.027, AED:0.027, COP:35.5, CLP:6.0, PKR:2.05, EGP:0.23, NGN:3.0, BDT:0.77, VND:175, RON:0.031, ARS:1.37, KWD:0.0022, OMR:0.0028, QAR:0.027, LKR: 2.2, GHS: 0.092, KZT: 3.48, TWD: 0.227, UAH: 0.275, ISK: 1.3, BHD: 0.0028, DZD:1, IQD: 9.7, JOD: 0.0052, MAD: 0.075, PAB: 0.0074, PEN: 0.027, UYU: 0.29, VES: 0.26, XOF: 4.55, VEF: 184 },
    IQD: { USD:0.00076, EUR:0.00065, GBP:0.00056, JPY:0.084, CAD:0.00095, AUD:0.001, CHF:0.00083, CNY:0.005, INR:0.057, BRL:0.004, NZD:0.0011, SEK:0.0066, NOK:0.0068, MXN:0.015, SGD:0.001, HKD:0.0059, KRW:0.9, ZAR:0.011, TRY:0.014, RUB:0.056, PLN:0.0028, HUF:0.25, DKK:0.005, CZK:0.016, MYR:0.0033, THB:0.026, IDR:4.0, PHP:0.04, ILS:0.0027, SAR:0.0028, AED:0.0028, COP:3.6, CLP:0.61, PKR:0.21, EGP:0.023, NGN:0.31, BDT:0.079, VND:18, RON:0.0033, ARS:0.15, KWD:0.0003, OMR:0.0004, QAR:0.0028, LKR: 0.23, GHS: 0.0095, KZT: 0.36, TWD: 0.031, UAH: 0.028, ISK: 0.13, BHD: 0.00029, DZD: 0.103, IQD:1, JOD: 0.00054, MAD: 0.0078, PAB: 0.00076, PEN: 0.0028, UYU: 0.03, VES: 0.027, XOF: 0.46, VEF: 18.9 },
    JOD: { USD:1.4, EUR:1.19, GBP:1.02, JPY:174, CAD:1.75, AUD:1.89, CHF:1.53, CNY:9.1, INR:105, BRL:7.38, NZD:2.0, SEK:12.1, NOK:12.4, MXN:28.3, SGD:1.9, HKD:11.0, KRW:1670, ZAR:20.5, TRY:26.5, RUB:105, PLN:5.3, HUF:455, DKK:8.8, CZK:30, MYR:6.2, THB:47, IDR:21000, PHP:78.8, ILS:5.0, SAR:5.2, AED:5.1, COP:6760, CLP:1140, PKR:390, EGP:43.4, NGN:576, BDT:146, VND:33200, RON:5.9, ARS:263, KWD:0.53, OMR:0.66, QAR:5.1, LKR: 420, GHS: 17.5, KZT: 658, TWD: 42.8, UAH: 52, ISK: 197, BHD: 0.53, DZD: 189, IQD: 1840, JOD:1, MAD: 14.4, PAB: 1.4, PEN: 5.18, UYU: 55, VES: 50.7, XOF: 866, VEF: 35000 },
    MAD: { USD:0.098, EUR:0.083, GBP:0.071, JPY:10.87, CAD:0.122, AUD:0.13, CHF:0.107, CNY:0.64, INR:7.3, BRL:0.51, NZD:0.139, SEK:0.84, NOK:0.86, MXN:1.97, SGD:0.132, HKD:0.75, KRW:116, ZAR:1.43, TRY:1.8, RUB:7.3, PLN:0.37, HUF:31.2, DKK:0.61, CZK:2.1, MYR:0.43, THB:3.4, IDR:1500, PHP:5.2, ILS:0.37, SAR:0.38, AED:0.37, COP:470, CLP:80, PKR:27.3, EGP:3.0, NGN:40, BDT:10.2, VND:2300, RON:0.41, ARS:18, KWD:0.036, OMR:0.047, QAR:0.38, LKR: 29.4, GHS: 1.22, KZT: 45.9, TWD: 2.97, UAH: 3.6, ISK: 13.6, BHD: 0.037, DZD: 4.88, IQD: 128, JOD: 0.07, MAD:1, PAB: 0.098, PEN: 0.36, UYU: 3.87, VES: 3.5, XOF: 60.3, VEF: 2436 },
    PAB: { USD:1, EUR:0.85, GBP:0.73, JPY:110.54, CAD:1.25, AUD:1.34, CHF:0.92, CNY:6.47, INR:74.5, BRL:5.25, NZD:1.42, SEK:8.67, NOK:8.93, MXN:20.1, SGD:1.35, HKD:7.79, KRW:1185, ZAR:14.6, TRY:18.7, RUB:74.1, PLN:3.77, HUF:320, DKK:6.3, CZK:21.5, MYR:4.4, THB:33.5, IDR:14850, PHP:55.8, ILS:3.6, SAR:3.75, AED:3.67, COP:4800, CLP:810, PKR:277, EGP:30.9, NGN:411, BDT:104, VND:23600, RON:4.2, ARS:185, KWD:0.30, OMR:0.38, QAR:3.64, LKR: 300, GHS: 12.5, KZT: 470, TWD: 30.5, UAH: 37, ISK: 140, BHD: 0.38, DZD: 135, IQD: 1310, JOD: 0.71, MAD: 10.2, PAB:1, PEN: 3.7, UYU: 39.5, VES: 36, XOF: 615, VEF: 24850 }, // Fixed to USD
    PEN: { USD:0.27, EUR:0.228, GBP:0.197, JPY:30, CAD:0.337, AUD:0.36, CHF:0.247, CNY:1.75, INR:18.8, BRL:1.3, NZD:0.38, SEK:2.27, NOK:2.33, MXN:5.4, SGD:0.36, HKD:2.1, KRW:317, ZAR:3.9, TRY:5.0, RUB:20, PLN:0.97, HUF:87, DKK:1.67, CZK:5.8, MYR:1.18, THB:9.0, IDR:4000, PHP:15, ILS:0.97, SAR:1.0, AED:0.99, COP:1300, CLP:220, PKR:75, EGP:8.4, NGN:111, BDT:28, VND:6378, RON:1.13, ARS:50, KWD:0.081, OMR:0.1, QAR:0.98, LKR: 81, GHS: 3.4, KZT: 127, TWD: 8.2, UAH: 10, ISK: 38, BHD: 0.1, DZD: 36.8, IQD: 355, JOD: 0.19, MAD: 2.75, PAB: 0.27, PEN:1, UYU: 10.6, VES: 9.7, XOF: 165, VEF: 6720 },
    UYU: { USD:0.025, EUR:0.021, GBP:0.0185, JPY:2.8, CAD:0.031, AUD:0.033, CHF:0.023, CNY:0.16, INR:1.9, BRL:0.13, NZD:0.036, SEK:0.21, NOK:0.22, MXN:0.5, SGD:0.034, HKD:0.19, KRW:29.8, ZAR:0.36, TRY:0.47, RUB:1.87, PLN:0.095, HUF:8.1, DKK:0.16, CZK:0.54, MYR:0.11, THB:0.85, IDR:375, PHP:1.4, ILS:0.09, SAR:0.095, AED:0.093, COP:120, CLP:20, PKR:6.9, EGP:0.78, NGN:10.4, BDT:2.6, VND:597, RON:0.106, ARS:4.7, KWD:0.0076, OMR:0.0096, QAR:0.093, LKR: 7.6, GHS: 0.316, KZT: 11.9, TWD: 0.77, UAH: 0.94, ISK: 3.5, BHD: 0.01, DZD: 3.4, IQD: 33, JOD: 0.018, MAD: 0.258, PAB: 0.025, PEN: 0.094, UYU:1, VES: 0.91, XOF: 15.5, VEF: 630 },
    VES: { USD:0.027, EUR:0.0235, GBP:0.02, JPY:3.06, CAD:0.034, AUD:0.037, CHF:0.025, CNY:0.18, INR:2.1, BRL:0.145, NZD:0.04, SEK:0.23, NOK:0.24, MXN:0.55, SGD:0.037, HKD:0.21, KRW:32.9, ZAR:0.4, TRY:0.52, RUB:2.0, PLN:0.10, HUF:8.8, DKK:0.177, CZK:0.6, MYR:0.12, THB:0.92, IDR:410, PHP:1.56, ILS:0.1, SAR:0.104, AED:0.1, COP:133, CLP:22.5, PKR:7.7, EGP:0.86, NGN:11.4, BDT:2.9, VND:660, RON:0.116, ARS:5.1, KWD:0.0083, OMR:0.0105, QAR:0.1, LKR: 8.3, GHS: 0.347, KZT: 13, TWD: 0.84, UAH: 1.03, ISK: 3.9, BHD: 0.011, DZD: 3.8, IQD: 37, JOD: 0.02, MAD: 0.28, PAB: 0.027, PEN: 0.103, UYU: 1.1, VES:1, XOF: 17.1, VEF: 690 },
    XOF: { USD:0.0016, EUR:0.0014, GBP:0.00118, JPY:0.18, CAD:0.002, AUD:0.0022, CHF:0.0015, CNY:0.0105, INR:0.12, BRL:0.0085, NZD:0.0023, SEK:0.0137, NOK:0.0145, MXN:0.032, SGD:0.0022, HKD:0.0126, KRW:1.9, ZAR:0.0237, TRY:0.03, RUB:0.12, PLN:0.006, HUF:0.53, DKK:0.01, CZK:0.035, MYR:0.0071, THB:0.054, IDR:2.4, PHP:0.09, ILS:0.0058, SAR:0.006, AED:0.006, COP:7.8, CLP:1.3, PKR:0.45, EGP:0.05, NGN:0.67, BDT:0.17, VND:38.4, RON:0.0068, ARS:0.3, KWD:0.00049, OMR:0.00063, QAR:0.006, LKR: 0.49, GHS: 0.02, KZT: 0.76, TWD: 0.049, UAH: 0.06, ISK: 0.23, BHD: 0.00062, DZD: 0.219, IQD: 2.17, JOD: 0.0011, MAD: 0.016, PAB: 0.0016, PEN: 0.006, UYU: 0.064, VES: 0.058, XOF:1, VEF: 40.4 },
    VEF: { USD:0.00004, EUR:0.000034, GBP:0.000029, JPY:0.0044, CAD:0.00005, AUD:0.000054, CHF:0.000037, CNY:0.00026, INR:0.003, BRL:0.0002, NZD:0.000057, SEK:0.00034, NOK:0.00036, MXN:0.0008, SGD:0.000054, HKD:0.00031, KRW:0.048, ZAR:0.00059, TRY:0.00075, RUB:0.003, PLN:0.00015, HUF:0.004, DKK:0.00025, CZK:0.0004, MYR:0.00018, THB:0.0013, IDR:0.6, PHP:0.0022, ILS:0.00014, SAR:0.00015, AED:0.00014, COP:0.02, CLP:0.032, PKR:0.011, EGP:0.0012, NGN:0.016, BDT:0.004, VND:0.03, RON:0.00017, ARS:0.0074, KWD:0.000012, OMR:0.000015, QAR:0.00015, LKR: 0.012, GHS: 0.0005, KZT: 0.019, TWD: 0.0012, UAH: 0.0015, ISK: 0.0056, BHD: 0.000015, DZD: 0.0054, IQD: 0.052, JOD: 0.000028, MAD: 0.0004, PAB: 0.00004, PEN: 0.00015, UYU: 0.00158, VES: 0.00145, XOF: 0.0247, VEF:1 }
  };

  const LS_AMOUNT = 'cc_amount';
  const LS_FROM = 'cc_from';
  const LS_TO = 'cc_to';
  const LS_HISTORY = 'cc_history';

  function restoreSettings() {
    const savedAmount = localStorage.getItem(LS_AMOUNT);
    const savedFrom = localStorage.getItem(LS_FROM);
    const savedTo = localStorage.getItem(LS_TO);
    if (savedAmount !== null) amountInput.value = savedAmount;
    if (savedFrom) fromCurrency.value = savedFrom;
    if (savedTo) toCurrency.value = savedTo;
  }

  function saveSettings() {
    localStorage.setItem(LS_AMOUNT, amountInput.value);
    localStorage.setItem(LS_FROM, fromCurrency.value);
    localStorage.setItem(LS_TO, toCurrency.value);
  }

  function formatCurrency(amount, currency) {
    try {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
    } catch {
      return Number(amount).toFixed(2);
    }
  }

  function showLoader() { loader.style.display='block'; loader.setAttribute('aria-hidden','false'); }
  function hideLoader() { loader.style.display='none'; loader.setAttribute('aria-hidden','true'); }
  function showError(msg) { errorText.textContent = msg; errorMessage.style.display='block'; }
  function hideError() { errorMessage.style.display='none'; }
  function updateLastUpdatedFor(base) {
    const entry = exchangeCache[base];
    lastUpdated.textContent = entry?.fetchedAt ? `Last Updated: ${new Date(entry.fetchedAt).toLocaleString()}` : 'Last Updated: --';
  }

  async function fetchRatesFor(base) {
    const cached = exchangeCache[base];
    if (cached && Date.now() - cached.fetchedAt < CACHE_DURATION) return cached.rates;
    showLoader();
    hideError();
    try {
      const resp = await fetch(`https://api.exchangerate.host/latest?base=${base}`);
      const json = await resp.json();
      if (!json.rates) throw new Error('Rates missing');
      exchangeCache[base] = { rates: json.rates, fetchedAt: Date.now() };
      updateLastUpdatedFor(base);
      hideLoader();
      return json.rates;
    } catch {
      hideLoader();
      showError('Live rates fetch failed; using fallback.');
      exchangeCache[base] = { rates: fallbackRates[base] || fallbackRates['USD'], fetchedAt: Date.now() };
      updateLastUpdatedFor(base);
      return exchangeCache[base].rates;
    }
  }

  async function convert() {
    const amount = parseFloat(amountInput.value);
    if (isNaN(amount) || amount < 0) {
      resultAmount.textContent = 'Please enter a valid amount';
      rateInfo.textContent = '';
      return;
    }

    const from = fromCurrency.value;
    const to = toCurrency.value;

    saveSettings();

    const rates = await fetchRatesFor(from);
    const rate = rates[to] ?? null;
    if (!rate) {
      showError('Exchange rate not available; showing approx.');
      resultAmount.textContent = formatCurrency(amount, to);
      rateInfo.textContent = `Exchange rate: not available`;
      return;
    }

    const result = amount * rate;
    resultAmount.textContent = formatCurrency(result, to);
    rateInfo.textContent = `Exchange rate: 1 ${from} = ${rate.toFixed(6)} ${to}`;
    hideError();
    updateLastUpdatedFor(from);
    addToHistory(amount, from, to, result);
    loadHistoricalChart();
  }

  function swapCurrencies() {
    const tmp = fromCurrency.value;
    fromCurrency.value = toCurrency.value;
    toCurrency.value = tmp;
    saveSettings();
    fetchRatesFor(fromCurrency.value).then(convert);
  }

  function resetConverter() {
    amountInput.value = '1';
    fromCurrency.value = 'USD';
    toCurrency.value = 'EUR';
    resultAmount.textContent = '0.00';
    rateInfo.textContent = 'Exchange rate: 1 USD = 0.00 EUR';
    hideError();
    saveSettings();
  }

  async function refreshRates() {
    delete exchangeCache[fromCurrency.value];
    await fetchRatesFor(fromCurrency.value);
    convert();
  }

  function addToHistory(amount, from, to, result) {
    const history = JSON.parse(localStorage.getItem(LS_HISTORY) || '[]');
    history.unshift({ amount, from, to, result: result.toFixed(2), timestamp: new Date().toLocaleString() });
    if (history.length > 10) history.pop();
    localStorage.setItem(LS_HISTORY, JSON.stringify(history));
    renderHistory();
  }

  function renderHistory() {
    const history = JSON.parse(localStorage.getItem(LS_HISTORY) || '[]');
    historyList.innerHTML = '';
    history.forEach(item => {
      const li = document.createElement('li');
      li.textContent = `${item.amount} ${item.from} = ${item.result} ${item.to} (${item.timestamp})`;
      historyList.appendChild(li);
    });
  }

  function toggleHistoryVisibility() {
    const isHidden = historyList.hidden;
    historyList.hidden = !isHidden;
    toggleHistory.setAttribute('aria-expanded', !isHidden);
  }

  async function loadHistoricalChart() {
    const from = fromCurrency.value;
    const to = toCurrency.value;
    try {
      const end = new Date();
      const start = new Date();
      start.setDate(end.getDate() - 7);
      const startStr = start.toISOString().split('T')[0];
      const endStr = end.toISOString().split('T')[0];

      const resp = await fetch(`https://api.exchangerate.host/timeseries?start_date=${startStr}&end_date=${endStr}&base=${from}&symbols=${to}`);
      const json = await resp.json();
      if (json.success) {
        const dates = Object.keys(json.rates).sort();
        const rates = dates.map(d => json.rates[d][to]);
        if (rateChart) rateChart.destroy();
        rateChart = new Chart(rateChartCanvas, {
          type: 'line',
          data: {
            labels: dates,
            datasets: [{
              label: `${from} → ${to}`,
              data: rates,
              borderColor:'#fdbb2d',
              backgroundColor:'rgba(253,187,45,0.1)',
              fill:true
            }]
          },
          options: { responsive:true, scales:{y:{beginAtZero:false}} }
        });
      }
    } catch(err) {
      console.warn('Historical chart failed', err);
    }
  }

  amountInput.addEventListener('keydown', e => { if(e.key==='Enter'){ e.preventDefault(); convert(); }});
  amountInput.addEventListener('input', () => { if(amountInput.value<0) amountInput.value=0; saveSettings(); });
  fromCurrency.addEventListener('change', () => { saveSettings(); fetchRatesFor(fromCurrency.value).then(convert); });
  toCurrency.addEventListener('change', () => { saveSettings(); loadHistoricalChart(); });
  swapButton.addEventListener('click', swapCurrencies);
  convertButton.addEventListener('click', convert);
  resetButton.addEventListener('click', resetConverter);
  refreshButton.addEventListener('click', refreshRates);
  toggleHistory.addEventListener('click', toggleHistoryVisibility);

  restoreSettings();
  renderHistory();
  fetchRatesFor(fromCurrency.value).then(() => convert());
});    