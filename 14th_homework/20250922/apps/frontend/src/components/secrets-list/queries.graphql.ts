import { gql } from "@apollo/client";

export const FETCH_TRAVELPRODUCTS = gql`
  query fetchTravelproducts($isSoldout: Boolean, $search: String, $page: Int) {
    fetchTravelproducts(isSoldout: $isSoldout, search: $search, page: $page) {
      _id
      name
      remarks
      contents
      price
      tags
      images
      pickedCount
      travelproductAddress {
        _id
        address
        addressDetail
        zipcode
        lat
        lng
      }
      buyer {
        _id
        name
        email
      }
      seller {
        _id
        name
        email
      }
      soldAt
      createdAt
      updatedAt
      deletedAt
    }
  }
`;

export const FETCH_TRAVELPRODUCT = gql`
  query fetchTravelproduct($travelproductId: ID!) {
    fetchTravelproduct(travelproductId: $travelproductId) {
      _id
      name
      remarks
      contents
      price
      tags
      images
      pickedCount
      travelproductAddress {
        _id
        address
        addressDetail
        zipcode
        lat
        lng
      }
      buyer {
        _id
        name
        email
      }
      seller {
        _id
        name
        email
      }
      soldAt
      createdAt
      updatedAt
      deletedAt
    }
  }
`;