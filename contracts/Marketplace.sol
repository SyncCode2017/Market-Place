// SPDX-License-Identifier: MIT

pragma solidity ^0.8.8;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/access/Ownable.sol";

error Marketplace__NewItemExist();
error Marketplace__NotOwner();
error Marketplace__NotYourOrder();
error Marketplace__SmallerBalance();

/** @title A contract for buying and selling items
 *  @author Abolaji
 *  @dev
 */

contract Marketplace {
    //Variables
    address private immutable feeAccount;
    uint256 public immutable feePercent;
    address public immutable i_owner;
    string public item;
    address payable internal user;
    uint256 public orderCount;

    struct _order {
        uint256 id;
        address seller;
        string item;
        uint256 qtty_to_sell;
        uint256 price;
        uint256 timestamp;
    }

    mapping(address => mapping(string => uint256)) public goods;

    // store the order
    mapping(address => uint256) public getBal;
    mapping(uint256 => _order) public orders;
    mapping(uint256 => ORDER_STATE) public orderStatus;
    mapping(uint256 => bool) public orderCancelled;
    mapping(uint256 => bool) public orderFilled;
    mapping(uint256 => bool) public orderCreated;
    mapping(uint256 => bool) public orderDelivered;
    mapping(uint256 => address) public Buyers;
    mapping(uint256 => uint256) public filledAmount;
    mapping(uint256 => uint256) public filledQuantity;
    //_order[] public OpenOrder;
    string[] public allowedItems;

    //Events
    event Deposit(address user, uint256 amount, uint256 bal);
    event Withdraw(address user, uint256 amount, uint256 bal);
    event OrderCreated(
        uint256 id,
        address seller,
        string item,
        uint256 qtty_to_sell,
        uint256 price,
        uint256 timestamp
    );
    event OrderFilled(
        uint256 id,
        address seller,
        address buyer,
        string item,
        uint256 qtty_bought,
        uint256 price,
        uint256 timestamp
    );
    event OrderDelivered(
        uint256 id,
        address seller,
        address buyer,
        string item,
        uint256 qtty_bought,
        uint256 price,
        uint256 timestamp
    );
    event CancelOpenOrder(
        uint256 id,
        address seller,
        string item,
        uint256 qtty_to_sell,
        uint256 price,
        uint256 timestamp
    );
    event CancelFilledOrder(
        uint256 id,
        address seller,
        address buyer,
        string item,
        uint256 qtty_bought,
        uint256 price,
        uint256 timestamp
    );

    enum ORDER_STATE {
        OPEN,
        FILLED,
        CLOSED
    }

    constructor(address _feeAccount, uint256 _feePercent) {
        feeAccount = _feeAccount;
        feePercent = _feePercent;
        i_owner = msg.sender;
    }

    function depositEther() public payable {
        getBal[msg.sender] = getBal[msg.sender] + msg.value;

        emit Deposit(msg.sender, msg.value, getBal[msg.sender]);
    }

    modifier onlyOwner() {
        if (msg.sender != i_owner) revert Marketplace__NotOwner();
        _;
    }

    // //Fallback: reverts if Ether is sent to this smart contract by mistake
    // function() external {
    //     revert();
    // }

    function withdrawEther(uint256 _amount) public {
        user = payable(msg.sender);
        //require(getBal[msg.sender] >= _amount);
        if (getBal[msg.sender] < _amount) {
            revert Marketplace__SmallerBalance();
        }
        getBal[msg.sender] = getBal[msg.sender] - _amount;
        user.transfer(_amount);
        emit Withdraw(msg.sender, _amount, getBal[msg.sender]);
    }

    function myBalance() public view returns (uint256) {
        return getBal[msg.sender];
    }

    // Create an order as a seller
    function makeOrder(
        string memory _item,
        uint256 _quantity,
        uint256 _price
    ) public {
        require(itemIsAllowed(_item), "Item is currently not allowed");
        orderCount = orderCount + 1;
        orders[orderCount] = _order(
            orderCount,
            msg.sender,
            _item,
            _quantity,
            _price,
            block.timestamp
        );
        orderStatus[orderCount] = ORDER_STATE.OPEN;
        goods[msg.sender][_item] = _quantity;
        emit OrderCreated(
            orderCount,
            msg.sender,
            _item,
            _quantity,
            _price,
            block.timestamp
        );
    }

    // Fill an order as a buyer
    function fillOrder(uint256 _id, uint256 _quantity) public {
        require(_id > 0 && _id <= orderCount);
        require(orderStatus[_id] == ORDER_STATE.OPEN);

        address _buyer = msg.sender;

        // Fetch the order
        _order memory order = orders[_id];
        require(_quantity <= order.qtty_to_sell, "Reduce the quantity");
        uint256 amount = _quantity * order.price;
        require(getBal[_buyer] >= amount, "You need more eth");

        _orderBond(_id, _buyer, _quantity, amount);

        // Mark order as filled
        orderFilled[_id] = true;
        orderStatus[_id] = ORDER_STATE.FILLED;
        Buyers[_id] = _buyer;
        filledAmount[_id] = amount;
        filledQuantity[_id] = _quantity;

        emit OrderFilled(
            _id,
            order.seller,
            _buyer,
            order.item,
            _quantity,
            order.price,
            block.timestamp
        );
    }

    //Getting orders that are still available for buying
    function open_order()
        public
        view
        returns (
            uint256[] memory idOrder,
            string[] memory _item,
            uint256[] memory _qty,
            uint256[] memory _prc
        )
    {
        idOrder = new uint256[](orderCount);
        _item = new string[](orderCount);
        _qty = new uint256[](orderCount);
        _prc = new uint256[](orderCount);
        for (uint256 i = 1; i <= orderCount; i++) {
            if (orderStatus[i] == ORDER_STATE.OPEN) {
                idOrder[i - 1] = orders[i].id;
                _item[i - 1] = orders[i].item;
                _qty[i - 1] = orders[i].qtty_to_sell;
                _prc[i - 1] = orders[i].price / (10**15);
            }
        }
        return (idOrder, _item, _qty, _prc);
    }

    // When the buyer confirms the receipt of the items, the money is released to the seller
    function OrderReceived(uint256 _id) public {
        address _buyer = Buyers[_id];
        _order memory order = orders[_id];
        require(orderStatus[_id] == ORDER_STATE.FILLED);
        require(msg.sender == _buyer, "Not your order");
        uint256 amount = filledAmount[_id];
        uint256 quantity = filledQuantity[_id];

        _orderCompleted(_id, _buyer, quantity, amount);
        orderStatus[_id] = ORDER_STATE.CLOSED;
        emit OrderDelivered(
            _id,
            order.seller,
            _buyer,
            order.item,
            quantity,
            order.price,
            block.timestamp
        );
    }

    function cancelOpenOrder(uint256 _id) public {
        _order memory order = orders[_id];
        require(order.seller == msg.sender, "Not your order"); // must be "my" order
        require(orderStatus[_id] == ORDER_STATE.OPEN);

        orderCancelled[_id] = true;
        orderStatus[_id] == ORDER_STATE.CLOSED;
        emit CancelOpenOrder(
            _id,
            order.seller,
            order.item,
            order.qtty_to_sell,
            order.price,
            block.timestamp
        );
    }

    function cancelFilledOrder(uint256 _id) public {
        _order memory order = orders[_id];
        address _buyer = Buyers[_id];
        require(
            order.seller == msg.sender || _buyer == msg.sender,
            "Not your order"
        ); // must be "my" order
        require(orderStatus[_id] == ORDER_STATE.FILLED);
        uint256 _amount = filledAmount[_id];
        uint256 _quantity = filledQuantity[_id];

        getBal[_buyer] = getBal[_buyer] + _amount;
        goods[msg.sender][order.item] =
            goods[msg.sender][order.item] +
            _quantity;
        orderStatus[_id] == ORDER_STATE.CLOSED;
        orderCancelled[_id] = true;
        emit CancelFilledOrder(
            _id,
            order.seller,
            _buyer,
            order.item,
            _quantity,
            order.price,
            block.timestamp
        );
    }

    function _orderBond(
        uint256 _id,
        address _buyer,
        uint256 _quantity,
        uint256 _amount
    ) internal {
        _order memory order = orders[_id];
        // place order
        getBal[_buyer] = getBal[_buyer] - _amount;
        goods[order.seller][order.item] =
            goods[order.seller][order.item] -
            _quantity;
    }

    function _orderCompleted(
        uint256 _id,
        address _buyer,
        uint256 _quantity,
        uint256 _amount
    ) internal {
        _order memory order = orders[_id];
        _amount = _amount - ((feePercent * _amount) / 100);

        getBal[order.seller] = getBal[order.seller] + _amount;
        goods[_buyer][order.item] = goods[_buyer][order.item] + _quantity;
        getBal[feeAccount] =
            getBal[feeAccount] +
            ((feePercent * _amount) / 100);
    }

    function addAllowedItems(string memory _item) public onlyOwner {
        //require (newItemIsUnique(_item));
        allowedItems.push(_item);
    }

    function itemIsAllowed(string memory _item) public view returns (bool) {
        for (
            uint256 allowedItemIndex = 0;
            allowedItemIndex < allowedItems.length;
            allowedItemIndex++
        ) {
            if (
                keccak256(bytes(allowedItems[allowedItemIndex])) ==
                keccak256(bytes(_item))
            ) {
                return true;
            }
        }
        return false;
    }

    // function newItemIsUnique(string memory _item) public view  returns (bool) {
    //     string[] memory itemArray= allowedItems;
    //     for (uint256 i=0; i<itemArray.length; i++){
    //         if (keccak256(bytes(itemArray[i]))==keccak256(bytes(_item))){
    //             revert Marketplace__NewItemExist();
    //         }
    //     }
    //     return true;
    // }

    function getAllowedItems() public view returns (string[] memory) {
        return allowedItems;
    }
}
