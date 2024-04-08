import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class GooglesheetsService {
  async getSheets(token: string) {
    try {
      // `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${token}`,
      return axios.get(
        `https://sheets.googleapis.com/v4/spreadsheets/1N9USlPVtWFBF20WGB7NmoKNcB8C_2ATFpkgA_hD4WuM/values/A4:C6`,
        {
          headers: {
            Authorization: `Bearer ${token}`, // Include access token in the request headers
          },
        },
      );
    } catch (error) {
      console.error('Failed to revoke the token:', error);
    }
  }
}
