export const idlFactory = ({ IDL }) => {
  const GenerateTicketArgs = IDL.Record({
    signature: IDL.Text,
    token_id: IDL.Text,
    target_chain_id: IDL.Text,
    amount: IDL.Nat64,
    receiver: IDL.Text,
  });
  const GenerateTicketError = IDL.Variant({
    SendTicketErr: IDL.Text,
    RpcError: IDL.Text,
    TemporarilyUnavailable: IDL.Text,
    AlreadyProcessed: IDL.Null,
    DecodeTxError: IDL.Text,
    MismatchWithGenTicketReq: IDL.Null,
    UnsupportedChainId: IDL.Text,
    UnsupportedToken: IDL.Text,
  });
  const Result = IDL.Variant({ Ok: IDL.Null, Err: GenerateTicketError });
  const GenTicketStatus = IDL.Variant({
    Finalized: GenerateTicketArgs,
    Unknown: IDL.Null,
  });
  const ChainState = IDL.Variant({
    Active: IDL.Null,
    Deactive: IDL.Null,
  });
  const ChainType = IDL.Variant({
    SettlementChain: IDL.Null,
    ExecutionChain: IDL.Null,
  });
  const Chain = IDL.Record({
    fee_token: IDL.Opt(IDL.Text),
    canister_id: IDL.Text,
    chain_id: IDL.Text,
    counterparties: IDL.Opt(IDL.Vec(IDL.Text)),
    chain_state: ChainState,
    chain_type: ChainType,
    contract_address: IDL.Opt(IDL.Text),
  });
  const Token = IDL.Record({
    decimals: IDL.Nat8,
    token_id: IDL.Text,
    metadata: IDL.Vec(IDL.Tuple(IDL.Text, IDL.Text)),
    icon: IDL.Opt(IDL.Text),
    name: IDL.Text,
    symbol: IDL.Text,
  });
  const ReleaseTokenStatus = IDL.Variant({
    Finalized: IDL.Text,
    Unknown: IDL.Null,
    Submitted: IDL.Text,
    Pending: IDL.Null,
  });
  const Result_1 = IDL.Variant({ Ok: IDL.Null, Err: IDL.Text });
  const RpcProvider = IDL.Record({
    host: IDL.Text,
    api_key_param: IDL.Opt(IDL.Text),
  });
  return IDL.Service({
    generate_ticket: IDL.Func([GenerateTicketArgs], [Result], []),
    generate_ticket_status: IDL.Func([IDL.Text], [GenTicketStatus], ['query']),
    get_chain_list: IDL.Func([], [IDL.Vec(Chain)], ['query']),
    get_payer_address: IDL.Func([], [IDL.Text], []),
    get_token_list: IDL.Func([], [IDL.Vec(Token)], ['query']),
    release_token_status: IDL.Func([IDL.Text], [ReleaseTokenStatus], ['query']),
    resubmit_release_token_tx: IDL.Func([IDL.Text], [Result_1], []),
    update_rpc_providers: IDL.Func([IDL.Vec(RpcProvider), IDL.Nat32], [], []),
  });
};

export const init = ({ IDL }) => {
  return [];
};
