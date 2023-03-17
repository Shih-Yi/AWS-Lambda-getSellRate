import axios from "axios"
import cheerio from "cheerio"
import * as dotenv from "dotenv"
dotenv.config()
import nodemailer from "nodemailer"
import { google } from "googleapis"

const OAuth2 = google.auth.OAuth2

const createTransporter = async () => {
  const oauth2Client = new OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    "https://developers.google.com/oauthplayground"
  )

  oauth2Client.setCredentials({
    refresh_token: process.env.REFRESH_TOKEN,
  })

  try {
    const accessToken = await oauth2Client.getAccessToken()
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: process.env.EMAIL,
        accessToken,
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        refreshToken: process.env.REFRESH_TOKEN,
      },
    })
    return transporter
  } catch (error) {
    console.log(error)
    throw error
  }
}

export const getSellRate1 = async () => {
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
      console.log("=================== sellRate < 19.5 ======================")
      const mailOptions = {
        from: "test@gmail.com",
        to: "test-user@gmail.com",
        subject: "TWD to NZD Sell Rate",
        text: `Sell Rate ${sellRate} is less then 19.5`,
      }
      const transporter = await createTransporter()
      await transporter.sendMail(mailOptions)
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
