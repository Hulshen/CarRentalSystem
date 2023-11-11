// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "./ERC4907.sol";     //ERC4907 无法直接导入，故到github上之间下载文件到本地导入
import "./MyERC20.sol";

contract CarRentalSystem is ERC4907 {

    MyERC20 public myERC20;
    uint256 carTokenId = 0;
    uint256 carPrice = 1 ether;
    uint256 rentPrice = 1;

    event CarOwned(uint256[]);
    event CarAvailable(uint256[]);

    struct Car {
        address owner;
        address renter;
        uint256 rentDDL;
    }

    mapping(uint256 => Car) private cars;           // a map from carId to it car
    mapping(address => uint256[]) private carList;  // a map from owner to his car array

    constructor() ERC4907("ZJUCarNFT", "ZJUCarNFTSymbol"){
        myERC20 = new MyERC20("ZJUToken", "ZJUTokenSymbol");
    }

    function issueCarNFT() public payable {
        _mint(msg.sender, carTokenId);
        cars[carTokenId].owner = msg.sender;
        cars[carTokenId].rentDDL = block.timestamp;
        carList[msg.sender].push(carTokenId);
        carTokenId++;
    }

    function getMyCars() public payable returns (uint256[] memory list) {
        list = carList[msg.sender];
        emit CarOwned(list);
    }

    function getAvailableCars() public payable returns (uint256[] memory) {
        uint256[] memory list = new uint256[](carTokenId);
        uint256 count = 0;
        for (uint256 idx = 0; idx < carTokenId; idx++) {
            if (cars[idx].rentDDL < block.timestamp) {
                list[count] = idx;
                count++;
            }
        }
        // 创建一个具有正确大小的新动态数组
        uint256[] memory result = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = list[i];
        }
        emit CarAvailable(result);
        return result;
    }

    function getCarInfo(uint256 carId) public payable returns (address owner, address renter) {
        require(carId < carTokenId, "This car doesn't exist.");
        owner = ownerOf(carId);
        renter = userOf(carId);
    }

    function rentCar(uint256 carId, uint256 rentDuration) public payable {
        uint256 cost = rentDuration * rentPrice;
        uint256 expire = block.timestamp + rentDuration*3600;
        require(carId < carTokenId, "This car doesn't exist.");
        require(cars[carId].rentDDL < block.timestamp, "This car has been rented");
        require(myERC20.balanceOf(msg.sender) > cost, "You don't have enough points.");
        cars[carId].renter = msg.sender;
        cars[carId].rentDDL = expire;
        setUser(carId, msg.sender, uint64(expire));
        myERC20.transferFrom(msg.sender, cars[carId].owner, cost);
    }
}
