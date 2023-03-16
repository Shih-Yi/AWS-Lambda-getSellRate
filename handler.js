import axios from "axios"
import cheerio from "cheerio"

export const getSellRate = async () => {
  try {
    const response = await axios(
      "https://www.esunbank.com.tw/bank/personal/deposit/rate/forex/foreign-exchange-rates"
    )
    const $ = cheerio.load(response.data)
    const sellRate = $(
      ".px-3.py-2.p-lg-0.NZD.currency .SellDecreaseRate"
    ).text()
    console.log(sellRate)
    if (sellRate < 19.5) {
      console.log(`${sellRate} is less then 19.5`)
    }
    return {
      statusCode: 200,
      body: { twdToNZDSellRate: sellRate },
    }
  } catch (error) {
    console.log(error)
    return {
      statusCode: 500,
      body: { msg: error },
    }
  }
}
