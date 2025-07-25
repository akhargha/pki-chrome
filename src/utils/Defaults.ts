export enum WebsiteListEntryLogType {
  PROTECTED,
  BLOCKED,
  NONE
}
export interface WebsiteListEntry {
  certChain: any;
  LogType: WebsiteListEntryLogType; // true if protected false if block
  addedAt: string;
  lastVisit: string;
  faviconUrl: string;
}


// Key = main URL (you said you run grabMainUrl yourself; I'm keeping the original www.* form)
export const WebsiteListDefaults: Record<string, WebsiteListEntry> = {
  "officesolutions.com": {
    certChain: {
      subject: {
        countryName: "US",
        stateOrProvinceName: "State",
        localityName: "City",
        organizationName: "MyLocalCA",
        commonName: "www.0fficesolutions.com"
      },
      issuer: {
        countryName: "US",
        stateOrProvinceName: "State",
        localityName: "City",
        organizationName: "MyLocalCA",
        commonName: "MyLocalCA"
      },
      serial_number: "5504a74ed3bc81cee4538cbb1938ac53f5f56a2",
      version: "v1",
      not_before: "2025-07-14T22:06:58+00:00",
      not_after: "2027-10-17T22:06:58+00:00"
    },
    LogType: 0,
    addedAt: "2025-07-14T22:06:58+00:00",
    lastVisit: "2025-07-14T22:06:58+00:00",
    faviconUrl: ""
  },
  "airlinkairlines.com": {
    certChain: {
      subject: {
        countryName: "US",
        stateOrProvinceName: "State",
        localityName: "City",
        organizationName: "MyLocalCA",
        commonName: "www.airlinkairways.com"
      },
      issuer: {
        countryName: "US",
        stateOrProvinceName: "State",
        localityName: "City",
        organizationName: "MyLocalCA",
        commonName: "MyLocalCA"
      },
      serial_number: "5504a74ed3bc81cee4538cbb1938ac53f5f56a3",
      version: "v1",
      not_before: "2025-07-14T22:06:58+00:00",
      not_after: "2027-10-17T22:06:58+00:00"
    },
    LogType: 0,
    addedAt: "2025-07-14T22:06:58+00:00",
    lastVisit: "2025-07-14T22:06:58+00:00",
    faviconUrl: ""
  },
  "airvoyageairlines.com": {
    certChain: {
      subject: {
        countryName: "US",
        stateOrProvinceName: "State",
        localityName: "City",
        organizationName: "MyLocalCA",
        commonName: "www.airvoyageairlines.com"
      },
      issuer: {
        countryName: "US",
        stateOrProvinceName: "State",
        localityName: "City",
        organizationName: "MyLocalCA",
        commonName: "MyLocalCA"
      },
      serial_number: "5504a74ed3bc81cee4538cbb1938ac53f5f56a4",
      version: "v1",
      not_before: "2025-07-14T22:06:58+00:00",
      not_after: "2027-10-17T22:06:58+00:00"
    },
    LogType: 0,
    addedAt: "2025-07-14T22:06:58+00:00",
    lastVisit: "2025-07-14T22:06:58+00:00",
    faviconUrl: ""
  },
  "cloudguard.com": {
    certChain: {
      subject: {
        countryName: "US",
        stateOrProvinceName: "State",
        localityName: "City",
        organizationName: "MyLocalCA",
        commonName: "www.cioudguard.com"
      },
      issuer: {
        countryName: "US",
        stateOrProvinceName: "State",
        localityName: "City",
        organizationName: "MyLocalCA",
        commonName: "MyLocalCA"
      },
      serial_number: "5504a74ed3bc81cee4538cbb1938ac53f5f56a6",
      version: "v1",
      not_before: "2025-07-14T22:06:58+00:00",
      not_after: "2027-10-17T22:06:58+00:00"
    },
    LogType: 0,
    addedAt: "2025-07-14T22:06:58+00:00",
    lastVisit: "2025-07-14T22:06:58+00:00",
    faviconUrl: ""
  },
  "citytrustbank.com": {
    certChain: {
      subject: {
        countryName: "US",
        stateOrProvinceName: "State",
        localityName: "City",
        organizationName: "MyLocalCA",
        commonName: "www.citytrustbank.com"
      },
      issuer: {
        countryName: "US",
        stateOrProvinceName: "State",
        localityName: "City",
        organizationName: "MyLocalCA",
        commonName: "MyLocalCA"
      },
      serial_number: "5504a74ed3bc81cee4538cbb1938ac53f5f56a7",
      version: "v1",
      not_before: "2025-07-14T22:06:58+00:00",
      not_after: "2027-10-17T22:06:58+00:00"
    },
    LogType: 0,
    addedAt: "2025-07-14T22:06:58+00:00",
    lastVisit: "2025-07-14T22:06:58+00:00",
    faviconUrl: ""
  },
  "cloudjetairways.com": {
    certChain: {
      subject: {
        countryName: "US",
        stateOrProvinceName: "State",
        localityName: "City",
        organizationName: "MyLocalCA",
        commonName: "www.cloudjetairways.com"
      },
      issuer: {
        countryName: "US",
        stateOrProvinceName: "State",
        localityName: "City",
        organizationName: "MyLocalCA",
        commonName: "MyLocalCA"
      },
      serial_number: "5504a74ed3bc81cee4538cbb1938ac53f5f56a8",
      version: "v1",
      not_before: "2025-07-14T22:06:58+00:00",
      not_after: "2027-10-17T22:06:58+00:00"
    },
    LogType: 0,
    addedAt: "2025-07-14T22:06:58+00:00",
    lastVisit: "2025-07-14T22:06:58+00:00",
    faviconUrl: ""
  },
  "corporateofficedirect.com": {
    certChain: {
      subject: {
        countryName: "US",
        stateOrProvinceName: "State",
        localityName: "City",
        organizationName: "MyLocalCA",
        commonName: "www.corporateofficedirect.com"
      },
      issuer: {
        countryName: "US",
        stateOrProvinceName: "State",
        localityName: "City",
        organizationName: "MyLocalCA",
        commonName: "MyLocalCA"
      },
      serial_number: "5504a74ed3bc81cee4538cbb1938ac53f5f56a9",
      version: "v1",
      not_before: "2025-07-14T22:06:58+00:00",
      not_after: "2027-10-17T22:06:58+00:00"
    },
    LogType: 0,
    addedAt: "2025-07-14T22:06:58+00:00",
    lastVisit: "2025-07-14T22:06:58+00:00",
    faviconUrl: ""
  },
  "cruiseairways.com": {
    certChain: {
      subject: {
        countryName: "US",
        stateOrProvinceName: "State",
        localityName: "City",
        organizationName: "MyLocalCA",
        commonName: "www.cruiseairways.com"
      },
      issuer: {
        countryName: "US",
        stateOrProvinceName: "State",
        localityName: "City",
        organizationName: "MyLocalCA",
        commonName: "MyLocalCA"
      },
      serial_number: "5504a74ed3bc81cee4538cbb1938ac53f5f56aa",
      version: "v1",
      not_before: "2025-07-14T22:06:58+00:00",
      not_after: "2027-10-17T22:06:58+00:00"
    },
    LogType: 0,
    addedAt: "2025-07-14T22:06:58+00:00",
    lastVisit: "2025-07-14T22:06:58+00:00",
    faviconUrl: ""
  },
  "dataflowenterprise.com": {
    certChain: {
      subject: {
        countryName: "US",
        stateOrProvinceName: "State",
        localityName: "City",
        organizationName: "MyLocalCA",
        commonName: "www.dataflowenterprise.com"
      },
      issuer: {
        countryName: "US",
        stateOrProvinceName: "State",
        localityName: "City",
        organizationName: "MyLocalCA",
        commonName: "MyLocalCA"
      },
      serial_number: "5504a74ed3bc81cee4538cbb1938ac53f5f56ab",
      version: "v1",
      not_before: "2025-07-14T22:06:58+00:00",
      not_after: "2027-10-17T22:06:58+00:00"
    },
    LogType: 0,
    addedAt: "2025-07-14T22:06:58+00:00",
    lastVisit: "2025-07-14T22:06:58+00:00",
    faviconUrl: ""
  },
  "deskpay.com": {
    certChain: {
      subject: {
        countryName: "US",
        stateOrProvinceName: "State",
        localityName: "City",
        organizationName: "MyLocalCA",
        commonName: "www.deskpay.com"
      },
      issuer: {
        countryName: "US",
        stateOrProvinceName: "State",
        localityName: "City",
        organizationName: "MyLocalCA",
        commonName: "MyLocalCA"
      },
      serial_number: "5504a74ed3bc81cee4538cbb1938ac53f5f56ac",
      version: "v1",
      not_before: "2025-07-14T22:06:58+00:00",
      not_after: "2027-10-17T22:06:58+00:00"
    },
    LogType: 0,
    addedAt: "2025-07-14T22:06:58+00:00",
    lastVisit: "2025-07-14T22:06:58+00:00",
    faviconUrl: ""
  },
  "docubridge.com": {
    certChain: {
      subject: {
        countryName: "US",
        stateOrProvinceName: "State",
        localityName: "City",
        organizationName: "MyLocalCA",
        commonName: "www.docubridge.com"
      },
      issuer: {
        countryName: "US",
        stateOrProvinceName: "State",
        localityName: "City",
        organizationName: "MyLocalCA",
        commonName: "MyLocalCA"
      },
      serial_number: "5504a74ed3bc81cee4538cbb1938ac53f5f56ad",
      version: "v1",
      not_before: "2025-07-14T22:06:58+00:00",
      not_after: "2027-10-17T22:06:58+00:00"
    },
    LogType: 0,
    addedAt: "2025-07-14T22:06:58+00:00",
    lastVisit: "2025-07-14T22:06:58+00:00",
    faviconUrl: ""
  },
  "fastbank.com": {
    certChain: {
      subject: {
        countryName: "US",
        stateOrProvinceName: "State",
        localityName: "City",
        organizationName: "MyLocalCA",
        commonName: "www.fastbank.com"
      },
      issuer: {
        countryName: "US",
        stateOrProvinceName: "State",
        localityName: "City",
        organizationName: "MyLocalCA",
        commonName: "MyLocalCA"
      },
      serial_number: "5504a74ed3bc81cee4538cbb1938ac53f5f56ae",
      version: "v1",
      not_before: "2025-07-14T22:06:59+00:00",
      not_after: "2027-10-17T22:06:59+00:00"
    },
    LogType: 0,
    addedAt: "2025-07-14T22:06:59+00:00",
    lastVisit: "2025-07-14T22:06:59+00:00",
    faviconUrl: ""
  },
  "fileflowpro.com": {
    certChain: {
      subject: {
        countryName: "US",
        stateOrProvinceName: "State",
        localityName: "City",
        organizationName: "MyLocalCA",
        commonName: "www.fileflowpro.com"
      },
      issuer: {
        countryName: "US",
        stateOrProvinceName: "State",
        localityName: "City",
        organizationName: "MyLocalCA",
        commonName: "MyLocalCA"
      },
      serial_number: "5504a74ed3bc81cee4538cbb1938ac53f5f56af",
      version: "v1",
      not_before: "2025-07-14T22:06:59+00:00",
      not_after: "2027-10-17T22:06:59+00:00"
    },
    LogType: 0,
    addedAt: "2025-07-14T22:06:59+00:00",
    lastVisit: "2025-07-14T22:06:59+00:00",
    faviconUrl: ""
  },
  "firstnationalbank.com": {
    certChain: {
      subject: {
        countryName: "US",
        stateOrProvinceName: "State",
        localityName: "City",
        organizationName: "MyLocalCA",
        commonName: "www.firstnationalbank.com"
      },
      issuer: {
        countryName: "US",
        stateOrProvinceName: "State",
        localityName: "City",
        organizationName: "MyLocalCA",
        commonName: "MyLocalCA"
      },
      serial_number: "5504a74ed3bc81cee4538cbb1938ac53f5f56b0",
      version: "v1",
      not_before: "2025-07-14T22:06:59+00:00",
      not_after: "2027-10-17T22:06:59+00:00"
    },
    LogType: 0,
    addedAt: "2025-07-14T22:06:59+00:00",
    lastVisit: "2025-07-14T22:06:59+00:00",
    faviconUrl: ""
  },
  "heritagebank.com": {
    certChain: {
      subject: {
        countryName: "US",
        stateOrProvinceName: "State",
        localityName: "City",
        organizationName: "MyLocalCA",
        commonName: "www.heritagebank.com"
      },
      issuer: {
        countryName: "US",
        stateOrProvinceName: "State",
        localityName: "City",
        organizationName: "MyLocalCA",
        commonName: "MyLocalCA"
      },
      serial_number: "5504a74ed3bc81cee4538cbb1938ac53f5f56b2",
      version: "v1",
      not_before: "2025-07-14T22:06:59+00:00",
      not_after: "2027-10-17T22:06:59+00:00"
    },
    LogType: 0,
    addedAt: "2025-07-14T22:06:59+00:00",
    lastVisit: "2025-07-14T22:06:59+00:00",
    faviconUrl: ""
  },
  "hrportal.com": {
    certChain: {
      subject: {
        countryName: "US",
        stateOrProvinceName: "State",
        localityName: "City",
        organizationName: "MyLocalCA",
        commonName: "www.hrportal.com"
      },
      issuer: {
        countryName: "US",
        stateOrProvinceName: "State",
        localityName: "City",
        organizationName: "MyLocalCA",
        commonName: "MyLocalCA"
      },
      serial_number: "5504a74ed3bc81cee4538cbb1938ac53f5f56b3",
      version: "v1",
      not_before: "2025-07-14T22:06:59+00:00",
      not_after: "2027-10-17T22:06:59+00:00"
    },
    LogType: 0,
    addedAt: "2025-07-14T22:06:59+00:00",
    lastVisit: "2025-07-14T22:06:59+00:00",
    faviconUrl: ""
  },
  "lakesideinn.com": {
    certChain: {
      subject: {
        countryName: "US",
        stateOrProvinceName: "State",
        localityName: "City",
        organizationName: "MyLocalCA",
        commonName: "www.lakesidelnn.com"
      },
      issuer: {
        countryName: "US",
        stateOrProvinceName: "State",
        localityName: "City",
        organizationName: "MyLocalCA",
        commonName: "MyLocalCA"
      },
      serial_number: "5504a74ed3bc81cee4538cbb1938ac53f5f56b4",
      version: "v1",
      not_before: "2025-07-14T22:06:59+00:00",
      not_after: "2027-10-17T22:06:59+00:00"
    },
    LogType: 0,
    addedAt: "2025-07-14T22:06:59+00:00",
    lastVisit: "2025-07-14T22:06:59+00:00",
    faviconUrl: ""
  },
  "libertyresort.com": {
    certChain: {
      subject: {
        countryName: "US",
        stateOrProvinceName: "State",
        localityName: "City",
        organizationName: "MyLocalCA",
        commonName: "www.libertyres0rt.com"
      },
      issuer: {
        countryName: "US",
        stateOrProvinceName: "State",
        localityName: "City",
        organizationName: "MyLocalCA",
        commonName: "MyLocalCA"
      },
      serial_number: "5504a74ed3bc81cee4538cbb1938ac53f5f56b5",
      version: "v1",
      not_before: "2025-07-14T22:06:59+00:00",
      not_after: "2027-10-17T22:06:59+00:00"
    },
    LogType: 0,
    addedAt: "2025-07-14T22:06:59+00:00",
    lastVisit: "2025-07-14T22:06:59+00:00",
    faviconUrl: ""
  },
  "mountainviewresort.com": {
    certChain: {
      subject: {
        countryName: "US",
        stateOrProvinceName: "State",
        localityName: "City",
        organizationName: "MyLocalCA",
        commonName: "www.mountainviewresort.com"
      },
      issuer: {
        countryName: "US",
        stateOrProvinceName: "State",
        localityName: "City",
        organizationName: "MyLocalCA",
        commonName: "MyLocalCA"
      },
      serial_number: "5504a74ed3bc81cee4538cbb1938ac53f5f56b6",
      version: "v1",
      not_before: "2025-07-14T22:06:59+00:00",
      not_after: "2027-10-17T22:06:59+00:00"
    },
    LogType: 0,
    addedAt: "2025-07-14T22:06:59+00:00",
    lastVisit: "2025-07-14T22:06:59+00:00",
    faviconUrl: ""
  },
  "officemax.com": {
    certChain: {
      subject: {
        countryName: "US",
        stateOrProvinceName: "State",
        localityName: "City",
        organizationName: "MyLocalCA",
        commonName: "www.officemax.com"
      },
      issuer: {
        countryName: "US",
        stateOrProvinceName: "State",
        localityName: "City",
        organizationName: "MyLocalCA",
        commonName: "MyLocalCA"
      },
      serial_number: "5504a74ed3bc81cee4538cbb1938ac53f5f56b8",
      version: "v1",
      not_before: "2025-07-14T22:06:59+00:00",
      not_after: "2027-10-17T22:06:59+00:00"
    },
    LogType: 0,
    addedAt: "2025-07-14T22:06:59+00:00",
    lastVisit: "2025-07-14T22:06:59+00:00",
    faviconUrl: ""
  },
  "officepaycentral.com": {
    certChain: {
      subject: {
        countryName: "US",
        stateOrProvinceName: "State",
        localityName: "City",
        organizationName: "MyLocalCA",
        commonName: "www.officepaycentral.com"
      },
      issuer: {
        countryName: "US",
        stateOrProvinceName: "State",
        localityName: "City",
        organizationName: "MyLocalCA",
        commonName: "MyLocalCA"
      },
      serial_number: "5504a74ed3bc81cee4538cbb1938ac53f5f56b9",
      version: "v1",
      not_before: "2025-07-14T22:06:59+00:00",
      not_after: "2027-10-17T22:06:59+00:00"
    },
    LogType: 0,
    addedAt: "2025-07-14T22:06:59+00:00",
    lastVisit: "2025-07-14T22:06:59+00:00",
    faviconUrl: ""
  },
  "payroll.com": {
    certChain: {
      subject: {
        countryName: "US",
        stateOrProvinceName: "State",
        localityName: "City",
        organizationName: "MyLocalCA",
        commonName: "www.payroll.com"
      },
      issuer: {
        countryName: "US",
        stateOrProvinceName: "State",
        localityName: "City",
        organizationName: "MyLocalCA",
        commonName: "MyLocalCA"
      },
      serial_number: "5504a74ed3bc81cee4538cbb1938ac53f5f56ba",
      version: "v1",
      not_before: "2025-07-14T22:06:59+00:00",
      not_after: "2027-10-17T22:06:59+00:00"
    },
    LogType: 0,
    addedAt: "2025-07-14T22:06:59+00:00",
    lastVisit: "2025-07-14T22:06:59+00:00",
    faviconUrl: ""
  },
  "paystream.com": {
    certChain: {
      subject: {
        countryName: "US",
        stateOrProvinceName: "State",
        localityName: "City",
        organizationName: "MyLocalCA",
        commonName: "www.paystream.com"
      },
      issuer: {
        countryName: "US",
        stateOrProvinceName: "State",
        localityName: "City",
        organizationName: "MyLocalCA",
        commonName: "MyLocalCA"
      },
      serial_number: "5504a74ed3bc81cee4538cbb1938ac53f5f56bb",
      version: "v1",
      not_before: "2025-07-14T22:06:59+00:00",
      not_after: "2027-10-17T22:06:59+00:00"
    },
    LogType: 0,
    addedAt: "2025-07-14T22:06:59+00:00",
    lastVisit: "2025-07-14T22:06:59+00:00",
    faviconUrl: ""
  },
  "relaxinn.com": {
    certChain: {
      subject: {
        countryName: "US",
        stateOrProvinceName: "State",
        localityName: "City",
        organizationName: "MyLocalCA",
        commonName: "www.relaxin.com"
      },
      issuer: {
        countryName: "US",
        stateOrProvinceName: "State",
        localityName: "City",
        organizationName: "MyLocalCA",
        commonName: "MyLocalCA"
      },
      serial_number: "5504a74ed3bc81cee4538cbb1938ac53f5f56bc",
      version: "v1",
      not_before: "2025-07-14T22:06:59+00:00",
      not_after: "2027-10-17T22:06:59+00:00"
    },
    LogType: 0,
    addedAt: "2025-07-14T22:06:59+00:00",
    lastVisit: "2025-07-14T22:06:59+00:00",
    faviconUrl: ""
  },
  "riseairways.com": {
    certChain: {
      subject: {
        countryName: "US",
        stateOrProvinceName: "State",
        localityName: "City",
        organizationName: "MyLocalCA",
        commonName: "www.riseairways.com"
      },
      issuer: {
        countryName: "US",
        stateOrProvinceName: "State",
        localityName: "City",
        organizationName: "MyLocalCA",
        commonName: "MyLocalCA"
      },
      serial_number: "5504a74ed3bc81cee4538cbb1938ac53f5f56bd",
      version: "v1",
      not_before: "2025-07-14T22:06:59+00:00",
      not_after: "2027-10-17T22:06:59+00:00"
    },
    LogType: 0,
    addedAt: "2025-07-14T22:06:59+00:00",
    lastVisit: "2025-07-14T22:06:59+00:00",
    faviconUrl: ""
  },
  "safebank.com": {
    certChain: {
      subject: {
        countryName: "US",
        stateOrProvinceName: "State",
        localityName: "City",
        organizationName: "MyLocalCA",
        commonName: "www.safebank.com"
      },
      issuer: {
        countryName: "US",
        stateOrProvinceName: "State",
        localityName: "City",
        organizationName: "MyLocalCA",
        commonName: "MyLocalCA"
      },
      serial_number: "5504a74ed3bc81cee4538cbb1938ac53f5f56be",
      version: "v1",
      not_before: "2025-07-14T22:06:59+00:00",
      not_after: "2027-10-17T22:06:59+00:00"
    },
    LogType: 0,
    addedAt: "2025-07-14T22:06:59+00:00",
    lastVisit: "2025-07-14T22:06:59+00:00",
    faviconUrl: ""
  },
  "safesendportal.com": {
    certChain: {
      subject: {
        countryName: "US",
        stateOrProvinceName: "State",
        localityName: "City",
        organizationName: "MyLocalCA",
        commonName: "www.safesendportal.com"
      },
      issuer: {
        countryName: "US",
        stateOrProvinceName: "State",
        localityName: "City",
        organizationName: "MyLocalCA",
        commonName: "MyLocalCA"
      },
      serial_number: "5504a74ed3bc81cee4538cbb1938ac53f5f56bf",
      version: "v1",
      not_before: "2025-07-14T22:06:59+00:00",
      not_after: "2027-10-17T22:06:59+00:00"
    },
    LogType: 0,
    addedAt: "2025-07-14T22:06:59+00:00",
    lastVisit: "2025-07-14T22:06:59+00:00",
    faviconUrl: ""
  },
  "sapphaireinn.com": {
    certChain: {
      subject: {
        commonName: "www.sapphaireinn.com"
      },
      issuer: {
        commonName: "www.sapphaireinn.com"
      },
      serial_number: "7452c53139ae8602c44d393634357b8824ded3ba",
      version: "v3",
      not_before: "2025-07-15T00:52:10+00:00",
      not_after: "2026-07-15T00:52:10+00:00"
    },
    LogType: 0,
    addedAt: "2025-07-15T00:52:10+00:00",
    lastVisit: "2025-07-15T00:52:10+00:00",
    faviconUrl: ""
  },
  "seasidegrandhotel.com": {
    certChain: {
      subject: {
        countryName: "US",
        stateOrProvinceName: "State",
        localityName: "City",
        organizationName: "MyLocalCA",
        commonName: "www.seasidegrandhotel.com"
      },
      issuer: {
        countryName: "US",
        stateOrProvinceName: "State",
        localityName: "City",
        organizationName: "MyLocalCA",
        commonName: "MyLocalCA"
      },
      serial_number: "5504a74ed3bc81cee4538cbb1938ac53f5f56c1",
      version: "v1",
      not_before: "2025-07-14T22:07:00+00:00",
      not_after: "2027-10-17T22:07:00+00:00"
    },
    LogType: 0,
    addedAt: "2025-07-14T22:07:00+00:00",
    lastVisit: "2025-07-14T22:07:00+00:00",
    faviconUrl: ""
  },
  "securelinkbusinessbanking.com": {
    certChain: {
      subject: {
        countryName: "US",
        stateOrProvinceName: "State",
        localityName: "City",
        organizationName: "MyLocalCA",
        commonName: "www.securelinkbusinessbanking.com"
      },
      issuer: {
        countryName: "US",
        stateOrProvinceName: "State",
        localityName: "City",
        organizationName: "MyLocalCA",
        commonName: "MyLocalCA"
      },
      serial_number: "5504a74ed3bc81cee4538cbb1938ac53f5f56c2",
      version: "v1",
      not_before: "2025-07-14T22:07:00+00:00",
      not_after: "2027-10-17T22:07:00+00:00"
    },
    LogType: 0,
    addedAt: "2025-07-14T22:07:00+00:00",
    lastVisit: "2025-07-14T22:07:00+00:00",
    faviconUrl: ""
  },
  "securevaultsystems.com": {
    certChain: {
      subject: {
        countryName: "US",
        stateOrProvinceName: "State",
        localityName: "City",
        organizationName: "MyLocalCA",
        commonName: "www.securevaultsystems.com"
      },
      issuer: {
        countryName: "US",
        stateOrProvinceName: "State",
        localityName: "City",
        organizationName: "MyLocalCA",
        commonName: "MyLocalCA"
      },
      serial_number: "5504a74ed3bc81cee4538cbb1938ac53f5f56c3",
      version: "v1",
      not_before: "2025-07-14T22:07:00+00:00",
      not_after: "2027-10-17T22:07:00+00:00"
    },
    LogType: 0,
    addedAt: "2025-07-14T22:07:00+00:00",
    lastVisit: "2025-07-14T22:07:00+00:00",
    faviconUrl: ""
  },
  "skywingsairlines.com": {
    certChain: {
      subject: {
        countryName: "US",
        stateOrProvinceName: "State",
        localityName: "City",
        organizationName: "MyLocalCA",
        commonName: "www.skywingsairways.com"
      },
      issuer: {
        countryName: "US",
        stateOrProvinceName: "State",
        localityName: "City",
        organizationName: "MyLocalCA",
        commonName: "MyLocalCA"
      },
      serial_number: "5504a74ed3bc81cee4538cbb1938ac53f5f56c4",
      version: "v1",
      not_before: "2025-07-14T22:07:00+00:00",
      not_after: "2027-10-17T22:07:00+00:00"
    },
    LogType: 0,
    addedAt: "2025-07-14T22:07:00+00:00",
    lastVisit: "2025-07-14T22:07:00+00:00",
    faviconUrl: ""
  },
  "spaceairwings.com": {
    certChain: {
      subject: {
        countryName: "US",
        stateOrProvinceName: "State",
        localityName: "City",
        organizationName: "MyLocalCA",
        commonName: "www.spaceairwings.com"
      },
      issuer: {
        countryName: "US",
        stateOrProvinceName: "State",
        localityName: "City",
        organizationName: "MyLocalCA",
        commonName: "MyLocalCA"
      },
      serial_number: "5504a74ed3bc81cee4538cbb1938ac53f5f56c5",
      version: "v1",
      not_before: "2025-07-14T22:07:00+00:00",
      not_after: "2027-10-17T22:07:00+00:00"
    },
    LogType: 0,
    addedAt: "2025-07-14T22:07:00+00:00",
    lastVisit: "2025-07-14T22:07:00+00:00",
    faviconUrl: ""
  },
  "sunsetboulevardhotel.com": {
    certChain: {
      subject: {
        countryName: "US",
        stateOrProvinceName: "State",
        localityName: "City",
        organizationName: "MyLocalCA",
        commonName: "www.sunsetboulevardmotel.com"
      },
      issuer: {
        countryName: "US",
        stateOrProvinceName: "State",
        localityName: "City",
        organizationName: "MyLocalCA",
        commonName: "MyLocalCA"
      },
      serial_number: "5504a74ed3bc81cee4538cbb1938ac53f5f56c6",
      version: "v1",
      not_before: "2025-07-14T22:07:00+00:00",
      not_after: "2027-10-17T22:07:00+00:00"
    },
    LogType: 0,
    addedAt: "2025-07-14T22:07:00+00:00",
    lastVisit: "2025-07-14T22:07:00+00:00",
    faviconUrl: ""
  },
  "supplypay.com": {
    certChain: {
      subject: {
        countryName: "US",
        stateOrProvinceName: "State",
        localityName: "City",
        organizationName: "MyLocalCA",
        commonName: "www.supplypay.com"
      },
      issuer: {
        countryName: "US",
        stateOrProvinceName: "State",
        localityName: "City",
        organizationName: "MyLocalCA",
        commonName: "MyLocalCA"
      },
      serial_number: "5504a74ed3bc81cee4538cbb1938ac53f5f56c7",
      version: "v1",
      not_before: "2025-07-14T22:07:00+00:00",
      not_after: "2027-10-17T22:07:00+00:00"
    },
    LogType: 0,
    addedAt: "2025-07-14T22:07:00+00:00",
    lastVisit: "2025-07-14T22:07:00+00:00",
    faviconUrl: ""
  },
  "urbanstaysuites.com": {
    certChain: {
      subject: {
        countryName: "US",
        stateOrProvinceName: "State",
        localityName: "City",
        organizationName: "MyLocalCA",
        commonName: "www.urbanstaysuites.com"
      },
      issuer: {
        countryName: "US",
        stateOrProvinceName: "State",
        localityName: "City",
        organizationName: "MyLocalCA",
        commonName: "MyLocalCA"
      },
      serial_number: "5504a74ed3bc81cee4538cbb1938ac53f5f56c8",
      version: "v1",
      not_before: "2025-07-14T22:07:00+00:00",
      not_after: "2027-10-17T22:07:00+00:00"
    },
    LogType: 0,
    addedAt: "2025-07-14T22:07:00+00:00",
    lastVisit: "2025-07-14T22:07:00+00:00",
    faviconUrl: ""
  },
  "worktracker.com": {
    certChain: {
      subject: {
        countryName: "US",
        stateOrProvinceName: "State",
        localityName: "City",
        organizationName: "MyLocalCA",
        commonName: "www.worktracker.com"
      },
      issuer: {
        countryName: "US",
        stateOrProvinceName: "State",
        localityName: "City",
        organizationName: "MyLocalCA",
        commonName: "MyLocalCA"
      },
      serial_number: "5504a74ed3bc81cee4538cbb1938ac53f5f56c9",
      version: "v1",
      not_before: "2025-07-14T22:07:00+00:00",
      not_after: "2027-10-17T22:07:00+00:00"
    },
    LogType: 0,
    addedAt: "2025-07-14T22:07:00+00:00",
    lastVisit: "2025-07-14T22:07:00+00:00",
    faviconUrl: ""
  }
};

// www.Officesolutions.com
// www.airLinkairlines.com
// www.airvoyageairlines.com
// www.cloudguard.com
// www.citytrustbank.com
// www.cloudjetairways.com
// www.corporateofficedirect.com
// www.dataflowenterprise.com
// www.firstnationalbank.com
// www.heritagebank.com
// www.hrportal.com
// www.lakesideInn.com
// www.mountainviewresort.com
// www.officemax.com
// www.payroll.com
// www.paystream.com
// www.riseairways.com
// www.seasidegrandhotel.com
// www.securelinkbusinessbanking.com
// www.securevaultsystems.com
// www.skywingsairlines.com
// www.sunsetboulevardhotel.com
// www.urbanstaysuites.com
// www.worktracker.com
// www.libertyresort.com
// www.cruiseairways.com
// www.relaxinn.com
// www.spaceairwings.com
// www.sapphaireinn.com
// www.horizonairways.com
// www.deskpay.com
// www.safesendportal.com
// www.safebank.com
// www.supplypay.com
// www.docubridge.com
// www.fastbank.com
// www.officepaycentral.com
// www.fileflowpro.com
// www.bankeasy.com
