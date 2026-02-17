/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const createChild = /* GraphQL */ `
  mutation CreateChild(
    $input: CreateChildInput!
    $condition: ModelChildConditionInput
  ) {
    createChild(input: $input, condition: $condition) {
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
export const updateChild = /* GraphQL */ `
  mutation UpdateChild(
    $input: UpdateChildInput!
    $condition: ModelChildConditionInput
  ) {
    updateChild(input: $input, condition: $condition) {
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
export const deleteChild = /* GraphQL */ `
  mutation DeleteChild(
    $input: DeleteChildInput!
    $condition: ModelChildConditionInput
  ) {
    deleteChild(input: $input, condition: $condition) {
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
export const createDailyReport = /* GraphQL */ `
  mutation CreateDailyReport(
    $input: CreateDailyReportInput!
    $condition: ModelDailyReportConditionInput
  ) {
    createDailyReport(input: $input, condition: $condition) {
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
export const updateDailyReport = /* GraphQL */ `
  mutation UpdateDailyReport(
    $input: UpdateDailyReportInput!
    $condition: ModelDailyReportConditionInput
  ) {
    updateDailyReport(input: $input, condition: $condition) {
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
export const deleteDailyReport = /* GraphQL */ `
  mutation DeleteDailyReport(
    $input: DeleteDailyReportInput!
    $condition: ModelDailyReportConditionInput
  ) {
    deleteDailyReport(input: $input, condition: $condition) {
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
export const createMeal = /* GraphQL */ `
  mutation CreateMeal(
    $input: CreateMealInput!
    $condition: ModelMealConditionInput
  ) {
    createMeal(input: $input, condition: $condition) {
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
export const updateMeal = /* GraphQL */ `
  mutation UpdateMeal(
    $input: UpdateMealInput!
    $condition: ModelMealConditionInput
  ) {
    updateMeal(input: $input, condition: $condition) {
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
export const deleteMeal = /* GraphQL */ `
  mutation DeleteMeal(
    $input: DeleteMealInput!
    $condition: ModelMealConditionInput
  ) {
    deleteMeal(input: $input, condition: $condition) {
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
export const createInvoice = /* GraphQL */ `
  mutation CreateInvoice(
    $input: CreateInvoiceInput!
    $condition: ModelInvoiceConditionInput
  ) {
    createInvoice(input: $input, condition: $condition) {
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
export const updateInvoice = /* GraphQL */ `
  mutation UpdateInvoice(
    $input: UpdateInvoiceInput!
    $condition: ModelInvoiceConditionInput
  ) {
    updateInvoice(input: $input, condition: $condition) {
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
export const deleteInvoice = /* GraphQL */ `
  mutation DeleteInvoice(
    $input: DeleteInvoiceInput!
    $condition: ModelInvoiceConditionInput
  ) {
    deleteInvoice(input: $input, condition: $condition) {
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
