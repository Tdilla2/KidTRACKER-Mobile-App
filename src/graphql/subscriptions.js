/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const onCreateChild = /* GraphQL */ `
  subscription OnCreateChild(
    $filter: ModelSubscriptionChildFilterInput
    $owner: String
  ) {
    onCreateChild(filter: $filter, owner: $owner) {
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
export const onUpdateChild = /* GraphQL */ `
  subscription OnUpdateChild(
    $filter: ModelSubscriptionChildFilterInput
    $owner: String
  ) {
    onUpdateChild(filter: $filter, owner: $owner) {
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
export const onDeleteChild = /* GraphQL */ `
  subscription OnDeleteChild(
    $filter: ModelSubscriptionChildFilterInput
    $owner: String
  ) {
    onDeleteChild(filter: $filter, owner: $owner) {
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
export const onCreateDailyReport = /* GraphQL */ `
  subscription OnCreateDailyReport(
    $filter: ModelSubscriptionDailyReportFilterInput
    $owner: String
  ) {
    onCreateDailyReport(filter: $filter, owner: $owner) {
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
export const onUpdateDailyReport = /* GraphQL */ `
  subscription OnUpdateDailyReport(
    $filter: ModelSubscriptionDailyReportFilterInput
    $owner: String
  ) {
    onUpdateDailyReport(filter: $filter, owner: $owner) {
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
export const onDeleteDailyReport = /* GraphQL */ `
  subscription OnDeleteDailyReport(
    $filter: ModelSubscriptionDailyReportFilterInput
    $owner: String
  ) {
    onDeleteDailyReport(filter: $filter, owner: $owner) {
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
export const onCreateMeal = /* GraphQL */ `
  subscription OnCreateMeal(
    $filter: ModelSubscriptionMealFilterInput
    $owner: String
  ) {
    onCreateMeal(filter: $filter, owner: $owner) {
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
export const onUpdateMeal = /* GraphQL */ `
  subscription OnUpdateMeal(
    $filter: ModelSubscriptionMealFilterInput
    $owner: String
  ) {
    onUpdateMeal(filter: $filter, owner: $owner) {
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
export const onDeleteMeal = /* GraphQL */ `
  subscription OnDeleteMeal(
    $filter: ModelSubscriptionMealFilterInput
    $owner: String
  ) {
    onDeleteMeal(filter: $filter, owner: $owner) {
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
export const onCreateInvoice = /* GraphQL */ `
  subscription OnCreateInvoice(
    $filter: ModelSubscriptionInvoiceFilterInput
    $owner: String
  ) {
    onCreateInvoice(filter: $filter, owner: $owner) {
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
export const onUpdateInvoice = /* GraphQL */ `
  subscription OnUpdateInvoice(
    $filter: ModelSubscriptionInvoiceFilterInput
    $owner: String
  ) {
    onUpdateInvoice(filter: $filter, owner: $owner) {
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
export const onDeleteInvoice = /* GraphQL */ `
  subscription OnDeleteInvoice(
    $filter: ModelSubscriptionInvoiceFilterInput
    $owner: String
  ) {
    onDeleteInvoice(filter: $filter, owner: $owner) {
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
