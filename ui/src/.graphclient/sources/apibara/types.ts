// @ts-nocheck

import { InContextSdkMethod } from '@graphql-mesh/types';
import { MeshContext } from '@graphql-mesh/runtime';

export namespace ApibaraTypes {
  export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  Decimal: any;
  DateTime: any;
  U256Value: any;
};

export type Query = {
  l2deposits: Array<L2Deposit>;
  deposit?: Maybe<L2Deposit>;
  l2withdrawals: Array<L2Withdrawal>;
};


export type Queryl2depositsArgs = {
  first?: InputMaybe<Scalars['Int']>;
  skip?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Scalars['String']>;
  orderByDirection?: InputMaybe<Scalars['String']>;
  where?: InputMaybe<WhereFilterForTransaction>;
};


export type QuerydepositArgs = {
  hash: Scalars['String'];
};


export type Queryl2withdrawalsArgs = {
  first?: InputMaybe<Scalars['Int']>;
  skip?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Scalars['String']>;
  orderByDirection?: InputMaybe<Scalars['String']>;
  where?: InputMaybe<WhereFilterForTransaction>;
};

export type L2Deposit = {
  id: Scalars['String'];
  l2Recipient: Scalars['String'];
  amount: Scalars['Decimal'];
  timestamp: Scalars['DateTime'];
  hash: Scalars['String'];
};

export type WhereFilterForTransaction = {
  id?: InputMaybe<Scalars['String']>;
};

export type L2Withdrawal = {
  l1Recipient: Scalars['String'];
  l2Sender: Scalars['String'];
  amount: Scalars['U256Value'];
  timestamp: Scalars['DateTime'];
};

  export type QuerySdk = {
      /** null **/
  l2deposits: InContextSdkMethod<Query['l2deposits'], Queryl2depositsArgs, MeshContext>,
  /** null **/
  deposit: InContextSdkMethod<Query['deposit'], QuerydepositArgs, MeshContext>,
  /** null **/
  l2withdrawals: InContextSdkMethod<Query['l2withdrawals'], Queryl2withdrawalsArgs, MeshContext>
  };

  export type MutationSdk = {
    
  };

  export type SubscriptionSdk = {
    
  };

  export type Context = {
      ["apibara"]: { Query: QuerySdk, Mutation: MutationSdk, Subscription: SubscriptionSdk },
      
    };
}