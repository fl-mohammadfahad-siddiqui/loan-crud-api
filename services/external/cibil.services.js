const axios = require('axios');

const CIBIL_API_URL = 'https://dqw6uizajg.execute-api.ap-south-1.amazonaws.com/mocks/bureau/cibil';

exports.checkCIBIL = async (leadData) => {
  try {
    const payload = {
      serviceCode: "CN1CAS0007",
      monitoringDate: "08102020", // use today's date in prod
      consumerInputSubject: {
        tuefHeader: {
          headerType: "TUEF",
          version: "12",
          memberRefNo: "NB7833",
          gstStateCode: "01",
          enquiryMemberUserId: "NB78338888_CIRC2CNPE",
          enquiryPassword: "Mf4@Eq2#Av8#Jv",
          enquiryPurpose: "10",
          enquiryAmount: "000049500",
          outputFormat: "03",
          responseSize: "1",
          ioMedia: "CC",
          authenticationMethod: "L"
        },
        names: [
          {
            index: "N01",
            firstName: leadData.first_name.toUpperCase(),
            middleName: "",
            lastName: leadData.last_name.toUpperCase(),
            birthDate: "01011990", // safe fallback
            gender: "1"
          }
        ],
        ids: [
          {
            index: "I01",
            idNumber: leadData.pan_card,
            idType: "01"
          }
        ],
        telephones: [
          {
            index: "T01",
            telephoneNumber: leadData.mobile,
            telephoneType: "01"
          }
        ],
        addresses: [
          {
            index: "A01",
            line1: "Line 1",
            line2: "Line 2",
            line3: "City",
            stateCode: "19",
            pinCode: "713347",
            addressCategory: "04",
            residenceCode: "01"
          }
        ]
      }
    };

    const response = await axios.post(CIBIL_API_URL, payload, {
      headers: { 'Content-Type': 'application/json' }
    });

    const result = response.data;

    const scoreObj = result.consumerCreditData?.[0]?.scores?.[0];
    const score = scoreObj?.score || null;
    const scoreDate = scoreObj?.scoreDate || null;
    const reasonCodes = scoreObj?.reasonCodes || [];

    return {
      success: true,
      score,
      scoreDate,
      reasonCodes,
      raw: result
    };

  } catch (error) {
    console.error("CIBIL Check Failed:", error.message);
    return {
      success: false,
      error: error.message,
      raw: error.response?.data || null
    };
  }
};
