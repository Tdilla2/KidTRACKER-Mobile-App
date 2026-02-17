/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getChild = /* GraphQL */ `
  query GetChild($id: ID!) {
    getChild(id: $id) {
      id
      name
      age
      classroom
      photo
      parentName
      parentEmail
      parentPhone
      parentAddress
      allergies
      medications
      pediatrician
      pediatricianPhone
      emergencyContacts
      authorizedPickups
      createdAt
      updatedAt
      owner
      __typename
    }
  }
`;
export const listChildren = /* GraphQL */ `
  query ListChildren(
    $filter: ModelChildFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listChildren(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        name
        age
        classroom
        photo
        parentName
        parentEmail
        parentPhone
        parentAddress
        allergies
        medications
        pediatrician
        pediatricianPhone
        emergencyContacts
        authorizedPickups
        createdAt
        updatedAt
        owner
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const getDailyReport = /* GraphQL */ `
  query GetDailyReport($id: ID!) {
    getDailyReport(id: $id) {
      id
      childId
      date
      isCheckedIn
      checkInTime
      checkOutTime
      checkInBy
      breakfastStatus
      lunchStatus
      snackStatus
      napStart
      napEnd
      activities
      bathroomNotes
      moodNotes
      teacherNotes
      photos
      createdAt
      updatedAt
      owner
      __typename
    }
  }
`;
export const listDailyReports = /* GraphQL */ `
  query ListDailyReports(
    $filter: ModelDailyReportFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listDailyReports(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        childId
        date
        isCheckedIn
        checkInTime
        checkOutTime
        checkInBy
        breakfastStatus
        lunchStatus
        snackStatus
        napStart
        napEnd
        activities
        bathroomNotes
        moodNotes
        teacherNotes
        photos
        createdAt
        updatedAt
        owner
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const getMeal = /* GraphQL */ `
  query GetMeal($id: ID!) {
    getMeal(id: $id) {
      id
      childId
      day
      date
      breakfast
      lunch
      snack
      createdAt
      updatedAt
      owner
      __typename
    }
  }
`;
export const listMeals = /* GraphQL */ `
  query ListMeals(
    $filter: ModelMealFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listMeals(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        childId
        day
        date
        breakfast
        lunch
        snack
        createdAt
        updatedAt
        owner
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const getInvoice = /* GraphQL */ `
  query GetInvoice($id: ID!) {
    getInvoice(id: $id) {
      id
      childId
      invoiceNumber
      date
      amount
      status
      dueDate
      createdAt
      updatedAt
      owner
      __typename
    }
  }
`;
export const listInvoices = /* GraphQL */ `
  query ListInvoices(
    $filter: ModelInvoiceFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listInvoices(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        childId
        invoiceNumber
        date
        amount
        status
        dueDate
        createdAt
        updatedAt
        owner
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const dailyReportsByChildIdAndDate = /* GraphQL */ `
  query DailyReportsByChildIdAndDate(
    $childId: ID!
    $date: ModelStringKeyConditionInput
    $sortDirection: ModelSortDirection
    $filter: ModelDailyReportFilterInput
    $limit: Int
    $nextToken: String
  ) {
    dailyReportsByChildIdAndDate(
      childId: $childId
      date: $date
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        childId
        date
        isCheckedIn
        checkInTime
        checkOutTime
        checkInBy
        breakfastStatus
        lunchStatus
        snackStatus
        napStart
        napEnd
        activities
        bathroomNotes
        moodNotes
        teacherNotes
        photos
        createdAt
        updatedAt
        owner
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const mealsByChildId = /* GraphQL */ `
  query MealsByChildId(
    $childId: ID!
    $sortDirection: ModelSortDirection
    $filter: ModelMealFilterInput
    $limit: Int
    $nextToken: String
  ) {
    mealsByChildId(
      childId: $childId
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        childId
        day
        date
        breakfast
        lunch
        snack
        createdAt
        updatedAt
        owner
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const invoicesByChildId = /* GraphQL */ `
  query InvoicesByChildId(
    $childId: ID!
    $sortDirection: ModelSortDirection
    $filter: ModelInvoiceFilterInput
    $limit: Int
    $nextToken: String
  ) {
    invoicesByChildId(
      childId: $childId
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        childId
        invoiceNumber
        date
        amount
        status
        dueDate
        createdAt
        updatedAt
        owner
        __typename
      }
      nextToken
      __typename
    }
  }
`;
