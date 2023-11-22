from yoomoney import Authorize

client_id = input("YooMoney Application's Client ID: ")
redirect_uri = input("Redirect URL: ")

Authorize(
      client_id=client_id,
      redirect_uri=redirect_uri,
      scope=["account-info",
             "operation-history",
             "operation-details",
             "incoming-transfers",
             "payment-p2p",
             "payment-shop",
             ]
      )