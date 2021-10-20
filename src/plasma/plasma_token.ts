import { BaseContract } from "../abstracts";
import { IContractInitParam, IPlasmaContracts, ITransactionOption } from "../interfaces";
import { BaseToken, promiseResolve, Web3SideChainClient } from "../utils";
import { ErcPredicate } from "./erc20_predicate";

export class PlasmaToken extends BaseToken {

    private predicate_: BaseContract;


    constructor(
        contractParam_: IContractInitParam,
        client: Web3SideChainClient,
        protected contracts_: IPlasmaContracts
    ) {
        super(contractParam_, client);
    }

    protected getPredicate_(methodName: string, contractName: string, predicateAddress: string): Promise<BaseContract> {
        if (this.predicate_) {
            return promiseResolve(this.predicate_);
        }
        const getPredicateAddress = () => {
            if (predicateAddress) {
                return promiseResolve<string>(predicateAddress);
            }
            return this.contracts_.registry.getContract().then(contract => {
                return contract.method(
                    methodName
                ).read<string>();
            });
        };
        getPredicateAddress().then(address => {
            return new ErcPredicate(
                this.client,
                address,
                contractName
            ).getContract();
        }).then(contract => {
            this.predicate_ = contract;
            return contract;
        });
    }

    withdrawExit(option?: ITransactionOption) {
        return this.contracts_.withdrawManager.withdrawExit(
            this.contractParam.address, option
        );
    }

}